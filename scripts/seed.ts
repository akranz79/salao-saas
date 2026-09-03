import { db, schema } from "../src/db";
import { hashPassword } from "../src/lib/password";
import { eq } from "drizzle-orm";

async function main() {
  const email = "demo@salaopro.com";

  const existing = await db.query.users.findFirst({
    where: eq(schema.users.email, email),
  });
  if (existing) {
    console.log("Seed já aplicado — usuário demo já existe. Nada a fazer.");
    return;
  }

  console.log("Criando salão de demonstração...");
  const [salon] = await db
    .insert(schema.salons)
    .values({
      name: "Studio Bella Hair",
      slug: "studio-bella-hair",
      phone: "(11) 4002-8922",
      address: "Rua das Flores, 123 - São Paulo/SP",
      openTime: "09:00",
      closeTime: "19:00",
    })
    .returning();

  const passwordHash = await hashPassword("demo123");
  await db.insert(schema.users).values({
    salonId: salon.id,
    name: "Ana Souza",
    email,
    passwordHash,
    role: "owner",
  });

  console.log("Cadastrando equipe...");
  const professionalsData = [
    { name: "Carla Mendes", specialty: "Coloração", commissionPct: 45, phone: "(11) 98888-1111" },
    { name: "Juliana Alves", specialty: "Corte e escova", commissionPct: 40, phone: "(11) 98888-2222" },
    { name: "Patrícia Lima", specialty: "Manicure e pedicure", commissionPct: 35, phone: "(11) 98888-3333" },
  ];
  const professionals = await db
    .insert(schema.professionals)
    .values(professionalsData.map((p) => ({ salonId: salon.id, ...p })))
    .returning();

  console.log("Cadastrando serviços...");
  const servicesData = [
    { name: "Corte feminino", durationMin: 45, price: 80 },
    { name: "Corte masculino", durationMin: 30, price: 50 },
    { name: "Escova modelada", durationMin: 40, price: 60 },
    { name: "Coloração completa", durationMin: 120, price: 220 },
    { name: "Manicure", durationMin: 40, price: 45 },
    { name: "Pedicure", durationMin: 45, price: 50 },
  ];
  const services = await db
    .insert(schema.services)
    .values(servicesData.map((s) => ({ salonId: salon.id, ...s })))
    .returning();

  console.log("Cadastrando clientes...");
  const today = new Date();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const clientsData = [
    { name: "Fernanda Costa", phone: "(11) 99111-0001", birthday: `1990-${mm}-08` },
    { name: "Beatriz Rocha", phone: "(11) 99111-0002", birthday: `1988-${mm}-21` },
    { name: "Camila Santos", phone: "(11) 99111-0003", birthday: "1995-01-30" },
    { name: "Larissa Pereira", phone: "(11) 99111-0004", birthday: "1992-03-12" },
    { name: "Mariana Oliveira", phone: "(11) 99111-0005", birthday: "1985-07-19" },
    { name: "Gabriela Fernandes", phone: "(11) 99111-0006", birthday: "1998-09-02" },
    { name: "Rafaela Martins", phone: "(11) 99111-0007", birthday: "1993-11-25" },
    { name: "Isabela Ramos", phone: "(11) 99111-0008", birthday: "1991-05-14" },
  ];
  const clients = await db
    .insert(schema.clients)
    .values(clientsData.map((c) => ({ salonId: salon.id, ...c })))
    .returning();

  console.log("Cadastrando produtos...");
  const productsData = [
    { name: "Shampoo profissional 1L", unit: "un", costPrice: 25, salePrice: 55, stockQty: 12, minStockQty: 5 },
    { name: "Condicionador profissional 1L", unit: "un", costPrice: 27, salePrice: 58, stockQty: 3, minStockQty: 5 },
    { name: "Tintura de cabelo", unit: "un", costPrice: 18, salePrice: 40, stockQty: 20, minStockQty: 8 },
    { name: "Esmalte", unit: "un", costPrice: 6, salePrice: 15, stockQty: 2, minStockQty: 6 },
    { name: "Óleo capilar finalizador", unit: "un", costPrice: 15, salePrice: 38, stockQty: 9, minStockQty: 4 },
  ];
  const products = await db
    .insert(schema.products)
    .values(productsData.map((p) => ({ salonId: salon.id, ...p })))
    .returning();

  await db.insert(schema.stockMovements).values(
    products.map((p) => ({
      salonId: salon.id,
      productId: p.id,
      type: "in" as const,
      quantity: p.stockQty,
      reason: "Estoque inicial",
    }))
  );

  console.log("Gerando agendamentos e histórico financeiro...");
  function at(daysFromToday: number, hour: number, minute = 0) {
    const d = new Date();
    d.setDate(d.getDate() + daysFromToday);
    d.setHours(hour, minute, 0, 0);
    return d;
  }

  const appointmentsPlan: {
    daysFromToday: number;
    hour: number;
    clientIdx: number;
    professionalIdx: number;
    serviceIdx: number;
    status: "scheduled" | "completed" | "cancelled" | "no_show";
  }[] = [
    { daysFromToday: -6, hour: 10, clientIdx: 0, professionalIdx: 0, serviceIdx: 3, status: "completed" },
    { daysFromToday: -5, hour: 14, clientIdx: 1, professionalIdx: 1, serviceIdx: 0, status: "completed" },
    { daysFromToday: -4, hour: 9, clientIdx: 2, professionalIdx: 2, serviceIdx: 4, status: "completed" },
    { daysFromToday: -3, hour: 11, clientIdx: 3, professionalIdx: 1, serviceIdx: 2, status: "completed" },
    { daysFromToday: -3, hour: 16, clientIdx: 4, professionalIdx: 0, serviceIdx: 3, status: "no_show" },
    { daysFromToday: -2, hour: 10, clientIdx: 5, professionalIdx: 2, serviceIdx: 5, status: "completed" },
    { daysFromToday: -1, hour: 13, clientIdx: 6, professionalIdx: 1, serviceIdx: 1, status: "completed" },
    { daysFromToday: -1, hour: 15, clientIdx: 7, professionalIdx: 0, serviceIdx: 0, status: "cancelled" },
    { daysFromToday: 0, hour: 10, clientIdx: 0, professionalIdx: 1, serviceIdx: 2, status: "scheduled" },
    { daysFromToday: 0, hour: 15, clientIdx: 2, professionalIdx: 2, serviceIdx: 4, status: "scheduled" },
    { daysFromToday: 1, hour: 9, clientIdx: 3, professionalIdx: 0, serviceIdx: 3, status: "scheduled" },
    { daysFromToday: 2, hour: 11, clientIdx: 5, professionalIdx: 1, serviceIdx: 0, status: "scheduled" },
  ];

  for (const item of appointmentsPlan) {
    const service = services[item.serviceIdx];
    const startAt = at(item.daysFromToday, item.hour);
    const endAt = new Date(startAt.getTime() + service.durationMin * 60_000);

    const [appointment] = await db
      .insert(schema.appointments)
      .values({
        salonId: salon.id,
        clientId: clients[item.clientIdx].id,
        professionalId: professionals[item.professionalIdx].id,
        serviceId: service.id,
        startAt: startAt.toISOString(),
        endAt: endAt.toISOString(),
        price: service.price,
        status: item.status,
      })
      .returning();

    if (item.status === "completed") {
      await db.insert(schema.transactions).values({
        salonId: salon.id,
        type: "income",
        category: "Serviço",
        amount: service.price,
        description: "Receita de atendimento",
        date: startAt.toISOString().slice(0, 10),
        appointmentId: appointment.id,
        professionalId: professionals[item.professionalIdx].id,
      });
    }
  }

  console.log("Lançando despesas do mês...");
  const monthStr = today.toISOString().slice(0, 7);
  await db.insert(schema.transactions).values([
    {
      salonId: salon.id,
      type: "expense",
      category: "Aluguel",
      amount: 2500,
      description: "Aluguel do espaço",
      date: `${monthStr}-05`,
    },
    {
      salonId: salon.id,
      type: "expense",
      category: "Produtos",
      amount: 480,
      description: "Compra de produtos para revenda",
      date: `${monthStr}-10`,
    },
    {
      salonId: salon.id,
      type: "expense",
      category: "Energia",
      amount: 320,
      description: "Conta de luz",
      date: `${monthStr}-15`,
    },
  ]);

  console.log("\nSeed concluído!");
  console.log("Acesse com:");
  console.log(`  E-mail: ${email}`);
  console.log("  Senha: demo123");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
