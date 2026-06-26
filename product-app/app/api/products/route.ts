import { NextRequest, NextResponse } from "next/server";
import type { Product, NewProductInput, ApiResponse } from "@/types";


let products: Product[] = [
  { id: "1", name: "Mechanical Keyboard", price: 89.99, createdAt: new Date().toISOString() },
  { id: "2", name: "Ultrawide Monitor", price: 449.0, createdAt: new Date().toISOString() },
];


function validateNewProduct(body: unknown): { valid: true; value: NewProductInput } | { valid: false; error: string } {
  if (typeof body !== "object" || body === null) {
    return { valid: false, error: "Request body must be a JSON object." };
  }

  const { name, price } = body as Record<string, unknown>;

  if (typeof name !== "string" || name.trim().length === 0) {
    return { valid: false, error: "Product name is required." };
  }
  if (name.trim().length > 100) {
    return { valid: false, error: "Product name must be 100 characters or fewer." };
  }
  if (typeof price !== "number" || Number.isNaN(price)) {
    return { valid: false, error: "Price must be a number." };
  }
  if (price <= 0) {
    return { valid: false, error: "Price must be greater than 0." };
  }

  return { valid: true, value: { name: name.trim(), price } };
}

export async function GET() {
  const body: ApiResponse<Product[]> = { ok: true, data: products };
  return NextResponse.json(body);
}


export async function POST(request: NextRequest) {
  let json: unknown;

  try {
    json = await request.json();
  } catch {
    const body: ApiResponse<never> = { ok: false, error: "Invalid JSON body." };
    return NextResponse.json(body, { status: 400 });
  }

  const result = validateNewProduct(json);
  if (!result.valid) {
    const body: ApiResponse<never> = { ok: false, error: result.error };
    return NextResponse.json(body, { status: 400 });
  }

  const newProduct: Product = {
    id: crypto.randomUUID(),
    name: result.value.name,
    price: result.value.price,
    createdAt: new Date().toISOString(),
  };

  products = [newProduct, ...products];

  const body: ApiResponse<Product> = { ok: true, data: newProduct };
  return NextResponse.json(body, { status: 201 });
}


export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");

  if (!id) {
    const body: ApiResponse<never> = { ok: false, error: "Missing 'id' query parameter." };
    return NextResponse.json(body, { status: 400 });
  }

  const existed = products.some((p) => p.id === id);
  if (!existed) {
    const body: ApiResponse<never> = { ok: false, error: `No product found with id '${id}'.` };
    return NextResponse.json(body, { status: 404 });
  }

  products = products.filter((p) => p.id !== id);

  const body: ApiResponse<{ id: string }> = { ok: true, data: { id } };
  return NextResponse.json(body);
}
