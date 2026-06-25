import { prisma } from "@/lib/prisma";
function firstClean(md:string){
  // strip markdown images/links, headings; take first real sentence(s)
  let t = md.replace(/!\[[^\]]*\]\([^)]*\)/g,"")        // images
           .replace(/\[([^\]]*)\]\([^)]*\)/g,"$1")       // links -> text
           .replace(/^#{1,6}\s.*$/gm,"")                 // headings
           .replace(/[*_`>#-]/g," ")
           .replace(/\s+/g," ").trim();
  return t.slice(0,180).trim();
}
(async()=>{
  const all=await prisma.article.findMany();
  let fixed=0;
  for(const a of all){
    const bad = /\/blog\/|\.png|\.webp|\.jpg|\n/.test(a.excerpt) || a.excerpt.length<30;
    if(bad){ const e=firstClean(a.contentMd); if(e){ await prisma.article.update({where:{id:a.id},data:{excerpt:e}}); fixed++; console.log("fixed:",a.slug,"->",e.slice(0,70)); } }
  }
  console.log("excerpts fixed:",fixed);
  await prisma.$disconnect();
})();
