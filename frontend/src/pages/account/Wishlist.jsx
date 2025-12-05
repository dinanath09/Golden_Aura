import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { Link } from "react-router-dom";

export default function Wishlist(){
  const [items,setItems]=useState([]);
  const load=()=> api.get("/wishlist").then(({data})=>setItems(data.items||[]));
  useEffect(()=>{ load(); },[]);

  const remove=async(id)=>{ await api.delete(`/wishlist/${id}`); load(); };

  if(!items.length) return <div>Your wishlist is empty.</div>;

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map(({product})=>(
        <div key={product._id} className="rounded border bg-white overflow-hidden">
          <Link to={`/products/${product.slug}`} className="block">
            <div className="aspect-[4/3] bg-zinc-100 flex items-center justify-center">
              {product.images?.[0]?.url ? (
                <img src={product.images[0].url} alt={product.title} className="h-[75%] object-contain"/>
              ) : <div className="text-zinc-400">No image</div>}
            </div>
          </Link>
          <div className="p-3 text-sm">
            <div className="font-medium">{product.title}</div>
            <div className="text-zinc-600">₹{product.price}</div>
            <div className="mt-2 flex gap-2">
              <Link to={`/products/${product.slug}`} className="px-3 py-1 rounded border">View</Link>
              <button onClick={()=>remove(product._id)} className="px-3 py-1 rounded border">Remove</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
