import {PrismaClient} from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();

async function main(){
  const pw = await bcrypt.hash("ChangeMeNow123!", 10);

  const admin = await prisma.user.upsert({
    where:{email:"admin@migrion.local"},
    update:{},
    create:{email:"admin@migrion.local",password:pw,role:"admin"}
  });

  const employer = await prisma.user.upsert({
    where:{email:"employer@migrion.local"},
    update:{},
    create:{email:"employer@migrion.local",password:pw,role:"employer", employer:{create:{company:"Demo Employer Ltd"}}}
  });

  const candUser = await prisma.user.upsert({
    where:{email:"candidate@migrion.local"},
    update:{},
    create:{email:"candidate@migrion.local",password:pw,role:"candidate", candidate:{create:{destination:"switzerland"}}}
  });
  const cand = await prisma.candidate.findUnique({where:{userId:candUser.id}});

  // Destinations
  const dests = [
    {slug:"switzerland", name:"Switzerland", region:"Europe"},
    {slug:"luxembourg", name:"Luxembourg", region:"Europe"},
    {slug:"canada", name:"Canada", region:"North America"},
    {slug:"united-kingdom", name:"United Kingdom", region:"Europe"},
    {slug:"australia", name:"Australia", region:"Oceania"}
  ];
  for(const d of dests){
    await prisma.destination.upsert({where:{slug:d.slug}, update:{name:d.name,region:d.region,enabled:true}, create:d});
  }

  // Default pages (EN/FR/DE)
  const pages = [];
  for(const d of dests){
    pages.push({slug:`country-${d.slug}`, locale:"en", title:`Move to ${d.name} with MIGRION™`, metaTitle:`${d.name} immigration pathway | MIGRION™`, metaDesc:`Phase-locked pathway to ${d.name} with escrow protection.`, bodyMd:`# ${d.name}\n\nMIGRION is phase-based: pay-before-service, employer validation, escrow milestones.`, videoUrl:null});
    pages.push({slug:`country-${d.slug}`, locale:"fr", title:`S’installer en ${d.name} avec MIGRION™`, metaTitle:`Immigration ${d.name} | MIGRION™`, metaDesc:`Parcours en phases, paiement avant service, séquestre.`, bodyMd:`# ${d.name}\n\nMIGRION est en phases : paiement avant service, validation employeur, séquestre.`, videoUrl:null});
    pages.push({slug:`country-${d.slug}`, locale:"de", title:`Nach ${d.name} mit MIGRION™`, metaTitle:`${d.name} Einwanderung | MIGRION™`, metaDesc:`Phasenbasiert, Zahlung vor Service, Treuhand.`, bodyMd:`# ${d.name}\n\nMIGRION ist phasenbasiert: Zahlung vor Service, Arbeitgebervalidierung, Treuhand.`, videoUrl:null});
  }
  for(const p of pages){
    await prisma.contentPage.upsert({where:{slug_locale:{slug:p.slug, locale:p.locale}}, update:{title:p.title,metaTitle:p.metaTitle,metaDesc:p.metaDesc,bodyMd:p.bodyMd,videoUrl:p.videoUrl}, create:p});
  }

  // Composite unique for contentPage
  // (handled via a Prisma preview workaround below)
  // If your Prisma version requires explicit @@unique, add it and migrate.

  // Milestones
  if(cand){
    const existing = await prisma.escrowMilestone.findMany({where:{candidateId:cand.id}});
    if(existing.length===0){
      await prisma.escrowMilestone.createMany({data:[
        {candidateId:cand.id,name:"File accepted",requiredProof:"Official acknowledgement",releaseCents:200000},
        {candidateId:cand.id,name:"Employer sponsorship confirmed",requiredProof:"Signed contract/letter",releaseCents:250000},
        {candidateId:cand.id,name:"Visa approved",requiredProof:"Approval notice",releaseCents:300000},
        {candidateId:cand.id,name:"Relocation completed",requiredProof:"Entry/onboarding confirmation",releaseCents:250000}
      ]});
    }
  }

  // Referral samples
  await prisma.referral.upsert({where:{code:"RES-001"}, update:{}, create:{type:"reseller",code:"RES-001",name:"Demo Reseller",email:"reseller@migrion.local"}});
  await prisma.referral.upsert({where:{code:"AMB-001"}, update:{}, create:{type:"ambassador",code:"AMB-001",name:"Demo Ambassador",email:"ambassador@migrion.local"}});

  console.log("Seed complete.");
}

main().finally(async()=>{await prisma.$disconnect();});
