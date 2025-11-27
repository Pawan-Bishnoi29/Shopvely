from django.db import models
from django.db.models import Sum, F
from django.contrib.auth import get_user_model
from django.db.models.signals import post_save
from django.dispatch import receiver
from products.models import Product

User = get_user_model()


class Order(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("processing", "Processing"),
        ("shipped", "Shipped"),
        ("delivered", "Delivered"),
        ("cancelled", "Cancelled"),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="orders",
        verbose_name="Customer",
        help_text="Customer who placed this order",
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Created at",
        help_text="Date and time when the order was created",
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="pending",
        verbose_name="Order status",
        help_text="Current processing status of this order",
    )
    total_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        verbose_name="Total amount (₹)",
        help_text="Total amount for this order in INR",
    )

    # ✅ Shipping address snapshot
    shipping_full_name = models.CharField(
        max_length=255,
        blank=True,
        help_text="Recipient full name at the time of order",
    )
    shipping_phone = models.CharField(
        max_length=20,
        blank=True,
        help_text="Recipient phone at the time of order",
    )
    shipping_line1 = models.CharField(
        max_length=255,
        blank=True,
        help_text="Address line 1 snapshot",
    )
    shipping_line2 = models.CharField(
        max_length=255,
        blank=True,
        help_text="Address line 2 snapshot",
    )
    shipping_city = models.CharField(
        max_length=100,
        blank=True,
        help_text="City at the time of order",
    )
    shipping_state = models.CharField(
        max_length=100,
        blank=True,
        help_text="State at the time of order",
    )
    shipping_pincode = models.CharField(
        max_length=20,
        blank=True,
        help_text="Pincode at the time of order",
    )

    def __str__(self):
        return f"Order #{self.id} by {self.user.username}"

    def update_total(self):
        total = self.items.aggregate(
            total=Sum(F("price") * F("quantity"))
        )["total"] or 0
        self.total_amount = total
        super().save(update_fields=["total_amount"])


class OrderItem(models.Model):
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name="items",
        verbose_name="Order",
        help_text="Parent order for this item",
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.PROTECT,
        verbose_name="Product",
        help_text="Product included in this order",
    )
    quantity = models.PositiveIntegerField(
        default=1,
        verbose_name="Quantity",
        help_text="Number of units for this product",
    )
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name="Unit price (₹)",
        help_text="Price per unit at the time of order",
    )

    def __str__(self):
        return f"{self.product.title} x {self.quantity}"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        self.order.update_total()


class OrderStatusHistory(models.Model):
    """
    Simple status change log per order.
    """

    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name="status_history",
        verbose_name="Order",
    )
    old_status = models.CharField(
        max_length=20,
        choices=Order.STATUS_CHOICES,
        null=True,
        blank=True,
        help_text="Previous status (nullable for first set)",
    )
    new_status = models.CharField(
        max_length=20,
        choices=Order.STATUS_CHOICES,
        help_text="New status applied to the order",
    )
    changed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="order_status_changes",
        help_text="Admin/user who changed the status",
    )
    changed_at = models.DateTimeField(
        auto_now_add=True,
        help_text="When this status change happened",
    )

    class Meta:
        verbose_name = "Order status history"
        verbose_name_plural = "Order status history"
        ordering = ["-changed_at"]

    def __str__(self):
        return f"Order #{self.order_id}: {self.old_status} → {self.new_status}"


@receiver(post_save, sender=Order)
def create_initial_status_history(sender, instance, created, **kwargs):
    """
    Jab naya order create ho to initial status history entry ban jaye.
    """
    if created:
        OrderStatusHistory.objects.create(
            order=instance,
            old_status=None,  # pehla status, koi old nahi
            new_status=instance.status,  # "pending" usually
            changed_by=None,  # system ne create kiya, user nahi
        )
