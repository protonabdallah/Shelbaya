import { prisma } from "@/lib/prisma";
import { HomeClient } from "@/components/home-client";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const featuredProducts = await prisma.product.findMany({
    where: { published: true, featured: true },
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  const productsToShow =
    featuredProducts.length > 0
      ? featuredProducts
      : await prisma.product.findMany({
          where: { published: true },
          orderBy: { createdAt: "desc" },
          take: 6,
        });

  return (
    <HomeClient
      featuredProducts={productsToShow.map((product) => ({
        ...product,
        createdAt: product.createdAt.toISOString(),
      }))}
    />
  );
}