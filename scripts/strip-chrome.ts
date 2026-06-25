import { prisma } from "@/lib/prisma";
const MARKERS = ["## Leia Também","## Leia também","## Artigos Relacionados","[Ver mais artigos]","### Fale com a Cont.Tool","Fale com a Cont.Tool"];
function strip(md:string){
  let cut = md.length;
  for(const m of MARKERS){ const i = md.indexOf(m); if(i>=0 && i<cut) cut=i; }
  return md.slice(0,cut).trim();
}
const norm=(s:string)=>s.normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase();
(async()=>{
  const all=await prisma.article.findMany();
  let changed=0;
  for(const a of all){ const c=strip(a.contentMd); if(c!==a.contentMd){ await prisma.article.update({where:{id:a.id},data:{contentMd:c}}); changed++; } }
  console.log("stripped chrome from", changed, "of", all.length);
  // verify search counts
  const after=await prisma.article.findMany();
  for(const term of ["feimec","tungstenio","gaveteiro","5s","automacao"]){
    const n=after.filter(a=>norm(`${a.title} ${a.excerpt} ${a.contentMd}`).includes(norm(term))).length;
    console.log(`  "${term}" ->`, n, "artigo(s)");
  }
  await prisma.$disconnect();
})();
