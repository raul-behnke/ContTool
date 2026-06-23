import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const name: string = (body.name ?? "").trim();
  const email: string = (body.email ?? "").trim().toLowerCase();
  if (!name || !email)
    return NextResponse.json({ error: "name, email required" }, { status: 400 });

  const clash = await prisma.user.findFirst({
    where: { email, NOT: { id } },
  });
  if (clash) return NextResponse.json({ error: "email exists" }, { status: 409 });

  const data: { name: string; email: string; passwordHash?: string } = { name, email };
  if (body.password) data.passwordHash = await bcrypt.hash(body.password, 10);

  const user = await prisma.user.update({
    where: { id },
    data,
    select: { id: true, name: true, email: true },
  });
  return NextResponse.json(user);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await params;
  const selfId = (session.user as { id?: string })?.id;
  if (selfId && selfId === id)
    return NextResponse.json({ error: "cannot delete yourself" }, { status: 400 });

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
