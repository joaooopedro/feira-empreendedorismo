import Guia from "@/components/Guia";
import { buscarBancas } from "@/lib/bancas";

// Renderiza no servidor a cada visita: a página chega pronta e depois segue ao vivo pelo Firestore.
export const dynamic = "force-dynamic";

export default async function Pagina() {
  return <Guia inicial={await buscarBancas()} />;
}
