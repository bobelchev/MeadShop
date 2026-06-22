import { createProduct } from '../actions';
import ProductForm from '../ProductForm';

export default function NewProductPage() {
  return <ProductForm action={createProduct} title="New Product" />;
}
