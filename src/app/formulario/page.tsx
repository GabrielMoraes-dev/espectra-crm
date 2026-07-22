import { notFound } from "next/navigation";

// Rota sem identificador — não há Lead/Cliente pra vincular o briefing, então
// nunca é um link válido. Nenhuma página do app aponta pra cá (confirmado por
// grep); links reais sempre usam /formulario/lead/[id] ou /formulario/cliente/[id].
export default function FormularioPage() {
  notFound();
}
