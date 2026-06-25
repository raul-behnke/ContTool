import { prisma } from "@/lib/prisma";
const TRAILING=["## Leia Também","## Leia também","## Artigos Relacionados","[Ver mais artigos]","### Fale com a Cont.Tool","Fale com a Cont.Tool"];
function cleanContent(md:string){
  // remove leading chrome up to & including the "Voltar para lista" link
  md = md.replace(/^[\s\S]*?\[Voltar para lista\]\([^)]*\)/, "");
  // trailing chrome
  let cut=md.length; for(const m of TRAILING){const i=md.indexOf(m); if(i>=0&&i<cut)cut=i;}
  return md.slice(0,cut).trim();
}
function firstClean(md:string){
  let t=md.replace(/!\[[^\]]*\]\([^)]*\)/g,"").replace(/\[([^\]]*)\]\([^)]*\)/g,"$1").replace(/^#{1,6}\s.*$/gm,"").replace(/[*_`>#]/g," ").replace(/\s+/g," ").trim();
  return t.slice(0,180).trim();
}
const badExc=(e:string)=>/\/blog\/|\.png|\.webp|\.jpg|min de leitura|Voltar para|\d{2}\/\d{2}\/\d{4}/.test(e)||e.length<30;
(async()=>{
  const all=await prisma.article.findMany();
  let c=0,e=0;
  for(const a of all){
    const cc=cleanContent(a.contentMd);
    const data:any={};
    if(cc && cc!==a.contentMd){ data.contentMd=cc; c++; }
    const base=cc||a.contentMd;
    if(badExc(a.excerpt)){ const ex=firstClean(base); if(ex){ data.excerpt=ex; e++; } }
    if(Object.keys(data).length) await prisma.article.update({where:{id:a.id},data});
  }
  console.log("content cleaned:",c,"| excerpts fixed:",e);
  console.log("=== samples ===");
  for(const slug of ["superciclo-do-tungstenio-2026","dicas-para-reduzir-o-consumo-de-ferramentas","feimec-2026"]){
    const a=await prisma.article.findUnique({where:{slug}});
    console.log("\n"+slug); console.log("  excerpt:", a!.excerpt.slice(0,90)); console.log("  content[0:90]:", a!.contentMd.slice(0,90));
  }
  await prisma.$disconnect();
})();
