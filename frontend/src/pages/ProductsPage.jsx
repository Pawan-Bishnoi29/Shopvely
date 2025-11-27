import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import API from "../api";
import ProductCard from "../components/ProductCard";
import "./ProductsPage.css";

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();

  const rawQuery = searchParams.get("q") || "";
  const query = rawQuery.toLowerCase().trim();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await API.get("/products/");
        setProducts(res.data);
      } catch (err) {
        console.error("Products load error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filtered = query
    ? products.filter((p) =>
        (p.title || "").toLowerCase().includes(query)
      )
    : products;

  if (loading) {
    return (
      <div className="products-wrapper">
        <p className="muted-text">Loading products...</p>
      </div>
    );
  }

  const hasQuery = query.length > 0;
  const resultsCount = filtered.length;

  return (
    <div className="products-wrapper">
      <h2 className="products-heading">All products</h2>

      {hasQuery && (
        <div className="products-search-info">
          {resultsCount > 0 ? (
            <p>
              Showing <strong>{resultsCount}</strong> result
              {resultsCount > 1 ? "s" : ""} for “{rawQuery}”.
            </p>
          ) : (
            <p>
              No products found for “{rawQuery}”. Try a different keyword or
              browse our latest items.
            </p>
          )}
        </div>
      )}

      <div className="products-grid">
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}

        {!hasQuery && filtered.length === 0 && (
          <p className="muted-text">There are no products available yet.</p>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;
