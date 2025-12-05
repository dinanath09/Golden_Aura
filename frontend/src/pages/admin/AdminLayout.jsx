import { NavLink, Outlet } from "react-router-dom";

export default function AdminLayout(){
  return (
    <div className="min-h-screen grid md:grid-cols-[240px_1fr] bg-zinc-50">
      <aside className="bg-white border-r">
        <div className="p-4 border-b">
          <div className="text-xl font-bold">Golden <span className="text-amber-600">Aura</span></div>
          <div className="text-xs text-zinc-500">Admin Panel</div>
        </div>
        <nav className="p-3 grid gap-1 text-sm">
          {[
            { to:'/admin', label:'Dashboard', end:true },
            { to:'/admin/store', label:'Store Settings' },
            { to:'/admin/products', label:'Products' },
            { to:'/admin/orders', label:'Orders' },
          ].map(i=>(
            <NavLink
              key={i.to}
              to={i.to}
              end={i.end}
              className={({isActive}) => `px-3 py-2 rounded-lg ${isActive?'bg-amber-50 text-amber-700':'hover:bg-zinc-100'}`}
            >
              {i.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <section className="p-6">
        <Outlet/>
      </section>
    </div>
  );
}
