import { prisma } from "@/lib/prisma";
function clean(md: string){
  const lines = md.split("\n");
  const noisy = (l: string)=>{
    const t=l.trim();
    if(t==="") return true;
    if(/^#{1,3}\s/.test(t)) return true;
    if(/Publicado em/i.test(t)||/Leitura estimada/i.test(t)||/Equipe Editorial/i.test(t)) return true;
    if(t.length<40 && /^[A-Za-zÀ-ÿ0-9 .\-]+$/.test(t) && !/[.!?]$/.test(t)) return true;
    return false;
  };
  let i=0; while(i<lines.length && noisy(lines[i])) i++;
  return lines.slice(i).join("\n").trim();
}
(async()=>{
  const arts = await prisma.article.findMany();
  let changed=0;
  for(const a of arts){
    const c = clean(a.contentMd);
    if(c && c!==a.contentMd){ await prisma.article.update({where:{id:a.id}, data:{contentMd:c}}); changed++; }
  }
  console.log("cleaned", changed, "of", arts.length);
  const s = await prisma.article.findUnique({where:{slug:"feimec-2026"}});
  console.log("--- feimec md[0:240] ---\n"+(s?.contentMd.slice(0,240)));
  await prisma.$disconnect();
})();
