import { prisma } from "@/lib/prisma";
(async()=>{
  const arts = await prisma.article.findMany();
  let set=0, stripped=0;
  for(const a of arts){
    let md = a.contentMd;
    let cover = a.coverImage;
    const m = md.match(/^\s*!\[[^\]]*\]\(([^)\s]+)[^)]*\)\s*$/m);
    // first image anywhere near the top
    const firstImg = md.match(/!\[[^\]]*\]\(([^)\s]+)[^)]*\)/);
    if((!cover || cover.trim()==="") && firstImg){
      cover = firstImg[1];
      set++;
    }
    // strip a leading image (first non-empty line is an image) to avoid dup with cover
    const lines = md.split("\n");
    let i=0; while(i<lines.length && lines[i].trim()==="") i++;
    if(i<lines.length && /^!\[[^\]]*\]\([^)]*\)\s*$/.test(lines[i].trim())){
      lines.splice(i,1); md = lines.join("\n").replace(/^\n+/,""); stripped++;
    }
    if(cover!==a.coverImage || md!==a.contentMd){
      await prisma.article.update({where:{id:a.id}, data:{coverImage:cover, contentMd:md}});
    }
  }
  console.log("covers set:",set," leading-img stripped:",stripped);
  const all = await prisma.article.findMany({select:{slug:true,coverImage:true},orderBy:{slug:"asc"}});
  for(const a of all) console.log((a.coverImage?"OK ":"NULL").padEnd(5), a.slug.slice(0,34).padEnd(35), (a.coverImage||"").slice(0,45));
  await prisma.$disconnect();
})();
