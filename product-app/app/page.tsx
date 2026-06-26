"use client";

import { useEffect, useState, useCallback, FormEvent } from "react";
import type { Product, ApiResponse } from "@/types";

type FormErrors = {
  name?: string;
  price?: string;
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false); 
  const [deletingId, setDeletingId] = useState<string | null>(null); 
  const [pageError, setPageError] = useState<string | null>(null); 

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [formErrors, setFormErrors] = useState<FormErrors>({});


  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setPageError(null);
    try {
      const res = await fetch("/api/products");
      const json: ApiResponse<Product[]> = await res.json();

      if (!res.ok || !json.ok) {
        throw new Error(!json.ok ? json.error : "Failed to load products.");
      }
      setProducts(json.data);
    } catch (err) {
      setPageError(err instanceof Error ? err.message : "Something went wrong while loading products.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);


  function validate(nameValue: string, priceValue: string): FormErrors {
    const errors: FormErrors = {};

    if (!nameValue.trim()) {
      errors.name = "Product name is required.";
    } else if (nameValue.trim().length > 100) {
      errors.name = "Name must be 100 characters or fewer.";
    }

    if (!priceValue.trim()) {
      errors.price = "Price is required.";
    } else {
      const parsed = Number(priceValue);
      if (Number.isNaN(parsed)) {
        errors.price = "Price must be a valid number.";
      } else if (parsed <= 0) {
        errors.price = "Price must be greater than 0.";
      }
    }

    return errors;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const errors = validate(name, price);
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      return; 
    }

    setIsSubmitting(true);
    setPageError(null);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), price: Number(price) }),
      });
      const json: ApiResponse<Product> = await res.json();

      if (!res.ok || !json.ok) {
        throw new Error(!json.ok ? json.error : "Failed to add product.");
      }

      setProducts((prev) => [json.data, ...prev]);
      setName("");
      setPrice("");
      setFormErrors({});
    } catch (err) {
      setPageError(err instanceof Error ? err.message : "Something went wrong while adding the product.");
    } finally {
      setIsSubmitting(false);
    }
  }


  async function handleDelete(id: string) {
    setDeletingId(id);
    setPageError(null);
    try {
      const res = await fetch(`/api/products?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const json: ApiResponse<{ id: string }> = await res.json();

      if (!res.ok || !json.ok) {
        throw new Error(!json.ok ? json.error : "Failed to delete product.");
      }

      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      setPageError(err instanceof Error ? err.message : "Something went wrong while deleting the product.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main style={{ maxWidth: 600, margin: "0 auto", padding: 24, fontFamily: "sans-serif" }}>
      <h1>Products</h1>

      {pageError && (
        <div
          role="alert"
          style={{ background: "#fee", border: "1px solid #c00", padding: 12, marginBottom: 16 }}
        >
          {pageError}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
        <div style={{ marginBottom: 8 }}>
          <label htmlFor="name">Name</label>
          <br />
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isSubmitting}
            aria-invalid={!!formErrors.name}
            aria-describedby={formErrors.name ? "name-error" : undefined}
          />
          {formErrors.name && (
            <div id="name-error" style={{ color: "#c00", fontSize: 13 }}>
              {formErrors.name}
            </div>
          )}
        </div>

        <div style={{ marginBottom: 8 }}>
          <label htmlFor="price">Price</label>
          <br />
          <input
            id="price"
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            disabled={isSubmitting}
            aria-invalid={!!formErrors.price}
            aria-describedby={formErrors.price ? "price-error" : undefined}
          />
          {formErrors.price && (
            <div id="price-error" style={{ color: "#c00", fontSize: 13 }}>
              {formErrors.price}
            </div>
          )}
        </div>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Adding..." : "Add Product"}
        </button>
      </form>

      {}
      {isLoading ? (
        <p>Loading products...</p>
      ) : products.length === 0 ? (
        <p>No products yet. Add one above.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {products.map((product) => (
            <li
              key={product.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid #ddd",
                padding: "8px 0",
              }}
            >
              <span>
                {product.name} — ${product.price.toFixed(2)}
              </span>
              <button
                onClick={() => handleDelete(product.id)}
                disabled={deletingId === product.id}
              >
                {deletingId === product.id ? "Deleting..." : "Delete"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
