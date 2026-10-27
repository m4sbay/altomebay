import {assets, type CategoryIcon} from "@/lib/content";
import {RetailArt} from "./RetailArt";
import {AssetNote} from "./AssetNote";
export function CategoryCard({label,example,art="pantry",count="KATEGORI"}:{label:string;example:string;icon?:CategoryIcon;art?:string;count?:string}){return <article className={`category-card min-w-0 category-${art}`}><div className="category-art overflow-hidden [transition:transform_.3s]"><span>{count}</span><RetailArt kind={art}/><AssetNote label={assets.category.label} size={assets.category.size}/></div><div className="category-caption"><h3>{label}</h3><p>{example}</p></div></article>;}
