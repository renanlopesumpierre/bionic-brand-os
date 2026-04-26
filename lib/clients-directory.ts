/**
 * Public directory of all TAG clients (across all lifecycle stages).
 * Only clients with `status: "active"` have a full brand space in `lib/content.ts`.
 *
 * This list is the source of truth for `/clients` and the portal home roster.
 */

export type ClientStatus = "active" | "coming-soon";

export type ClientCategory =
  | "food-beverage"
  | "branding-design"
  | "consulting"
  | "creator"
  | "education"
  | "hospitality"
  | "real-estate"
  | "industry-product"
  | "legal"
  | "marketing"
  | "fashion-retail"
  | "events"
  | "health-wellbeing"
  | "technology";

export type ClientEntry = {
  slug: string;
  name: string;
  category: ClientCategory;
  role: string; // short role/positioning line
  description: string; // one-line description
  status: ClientStatus;
};

export const CATEGORY_LABELS: Record<ClientCategory, string> = {
  "food-beverage": "Alimentação e Bebidas",
  "branding-design": "Branding e Posicionamento",
  consulting: "Consultoria e Mentoria",
  creator: "Creators e Influencers",
  education: "Educação e Treinamento",
  hospitality: "Hotelaria e Turismo",
  "real-estate": "Imobiliárias e Construtoras",
  "industry-product": "Indústria e Produtos",
  legal: "Jurídico e Direito",
  marketing: "Marketing e Publicidade",
  "fashion-retail": "Moda e Varejo",
  events: "Produção de Eventos",
  "health-wellbeing": "Saúde e Bem-Estar",
  technology: "Tecnologia e Software",
};

/**
 * Alphabetical order (pt-BR) for category chips on the UI.
 */
export const CATEGORY_ORDER: ClientCategory[] = [
  "food-beverage",
  "branding-design",
  "consulting",
  "creator",
  "education",
  "hospitality",
  "real-estate",
  "industry-product",
  "legal",
  "marketing",
  "fashion-retail",
  "events",
  "health-wellbeing",
  "technology",
];

export const clientsDirectory: ClientEntry[] = [
  {
    slug: "academia-lendaria",
    name: "Academia Lendária",
    category: "education",
    role: "Educação em negócios e IA",
    description:
      "Formação prática para líderes, empreendedores e criadores.",
    status: "coming-soon",
  },
  {
    slug: "althea",
    name: "Althea",
    category: "health-wellbeing",
    role: "Instituto de nutrição e saúde",
    description: "Saúde intestinal, performance e emagrecimento.",
    status: "coming-soon",
  },
  {
    slug: "autentica",
    name: "Autêntica",
    category: "branding-design",
    role: "Consultoria de posicionamento",
    description: "Estratégia para marcas construírem autoridade.",
    status: "coming-soon",
  },
  {
    slug: "betina-weber",
    name: "Betina Weber",
    category: "consulting",
    role: "Conselheira estratégica",
    description: "Estratégias de crescimento, direção e resultado.",
    status: "active",
  },
  {
    slug: "black-bison",
    name: "Black Bison",
    category: "food-beverage",
    role: "Hamburgueria artesanal",
    description: "Burgers artesanais em Pelotas.",
    status: "coming-soon",
  },
  {
    slug: "bruna-crachi",
    name: "Bruna Crachi",
    category: "health-wellbeing",
    role: "Personal trainer",
    description: "Treinos para força, disciplina e transformação corporal.",
    status: "coming-soon",
  },
  {
    slug: "bydunky",
    name: "Bydunky",
    category: "fashion-retail",
    role: "Sneakers urbanos premium",
    description: "Tênis exclusivos para estilo urbano e atitude.",
    status: "coming-soon",
  },
  {
    slug: "caroll-gonzalez",
    name: "Caroll Gonzalez",
    category: "events",
    role: "Cerimonialista de casamentos",
    description:
      "Organização leve para noivas aproveitarem o próprio casamento.",
    status: "coming-soon",
  },
  {
    slug: "cibelle-orige",
    name: "Cibelle Orige",
    category: "health-wellbeing",
    role: "Nutricionista plant-based",
    description: "Nutrição, bioquímica e estratégia alimentar.",
    status: "coming-soon",
  },
  {
    slug: "ciro-campos",
    name: "Ciro Campos",
    category: "health-wellbeing",
    role: "Cardiologista",
    description: "Prevenção cardiovascular, alta performance e longevidade.",
    status: "coming-soon",
  },
  {
    slug: "dani-badaro",
    name: "Dani Badaró",
    category: "creator",
    role: "Fotógrafa",
    description: "Fotografia de família, marcas e memórias afetivas.",
    status: "coming-soon",
  },
  {
    slug: "daniella-feliciano",
    name: "Daniella Feliciano",
    category: "legal",
    role: "Advogada de família",
    description: "Soluções jurídicas para relações familiares.",
    status: "coming-soon",
  },
  {
    slug: "daskalos",
    name: "Daskalos",
    category: "legal",
    role: "Propriedade intelectual",
    description: "Registro e proteção estratégica de marcas.",
    status: "coming-soon",
  },
  {
    slug: "exclusive-sul",
    name: "Exclusive Sul",
    category: "real-estate",
    role: "Imobiliária alto padrão",
    description:
      "Consultoria imobiliária em Pelotas com imóveis selecionados.",
    status: "coming-soon",
  },
  {
    slug: "fala-doutores",
    name: "Fala Doutores",
    category: "creator",
    role: "Conteúdo para médicos",
    description: "Conversas e mercado da medicina real.",
    status: "coming-soon",
  },
  {
    slug: "forefy",
    name: "Forefy",
    category: "education",
    role: "Plataforma de estudos para concursos",
    description: "Materiais, simulados e videoaulas para aprovação.",
    status: "coming-soon",
  },
  {
    slug: "geracao-lumi",
    name: "Geração Lumi",
    category: "education",
    role: "Capacitação em IA e educação",
    description:
      "Treinamentos de inteligência artificial e desenvolvimento educacional.",
    status: "coming-soon",
  },
  {
    slug: "gismari",
    name: "Gismari",
    category: "health-wellbeing",
    role: "Nutricionista integrativa",
    description: "Programas de saúde, beleza e longevidade 40+.",
    status: "coming-soon",
  },
  {
    slug: "heineken",
    name: "Heineken",
    category: "food-beverage",
    role: "Cervejaria global",
    description: "Marca internacional de cerveja premium.",
    status: "coming-soon",
  },
  {
    slug: "influmark",
    name: "Influmark",
    category: "marketing",
    role: "Marketing de influência",
    description: "Estratégia e campanhas com influenciadores.",
    status: "coming-soon",
  },
  {
    slug: "inplane",
    name: "Inplane",
    category: "health-wellbeing",
    role: "Treinamentos médicos",
    description:
      "Intervenções guiadas por ultrassom para médicos e equipes.",
    status: "coming-soon",
  },
  {
    slug: "joia-do-mato",
    name: "Jóia do Mato",
    category: "hospitality",
    role: "Cabanas de alto padrão",
    description: "Hospedagem premium nos cânions de Cambará do Sul.",
    status: "coming-soon",
  },
  {
    slug: "kuroda",
    name: "Kuroda",
    category: "industry-product",
    role: "Expositores para joias",
    description:
      "Comunicação visual estratégica para valorizar vitrines e lojas.",
    status: "coming-soon",
  },
  {
    slug: "magalu",
    name: "Magalu",
    category: "fashion-retail",
    role: "Varejo e tecnologia",
    description: "Ecossistema digital de varejo brasileiro.",
    status: "coming-soon",
  },
  {
    slug: "marcela-souza",
    name: "Marcela Souza",
    category: "consulting",
    role: "Família e negócios",
    description: "Mentoria para empresas familiares com método 4Ps.",
    status: "coming-soon",
  },
  {
    slug: "marcelo-zanoni",
    name: "Marcelo Zanoni",
    category: "health-wellbeing",
    role: "Cirurgião vascular",
    description: "Tratamento de varizes, vasinhos e saúde das pernas.",
    status: "coming-soon",
  },
  {
    slug: "mari-domingos",
    name: "Mari Domingos",
    category: "consulting",
    role: "Growth Branding",
    description: "Branding e posicionamento estratégico.",
    status: "coming-soon",
  },
  {
    slug: "marina-morillos",
    name: "Marina Morillos",
    category: "consulting",
    role: "Estrategista de negócios digitais",
    description: "Funis de venda e produtos digitais implementados.",
    status: "coming-soon",
  },
  {
    slug: "mikaeli-scudeler",
    name: "Mikaeli Scudeler",
    category: "legal",
    role: "Advogada previdenciária e internacional",
    description: "Aposentadoria, visto e saída fiscal para brasileiros.",
    status: "coming-soon",
  },
  {
    slug: "neocortex",
    name: "Neocortex",
    category: "technology",
    role: "Framework de desenvolvimento com IA",
    description: "Automação, multiagentes e sistemas inteligentes.",
    status: "coming-soon",
  },
  {
    slug: "oceanmed",
    name: "OceanMed",
    category: "health-wellbeing",
    role: "Marketing e performance para clínicas",
    description:
      "Consultoria para crescimento e aquisição de pacientes.",
    status: "coming-soon",
  },
  {
    slug: "ornexus",
    name: "OrNexus",
    category: "technology",
    role: "Ecossistemas de negócios com IA",
    description: "Automação, IA e machine learning para empresas.",
    status: "coming-soon",
  },
  {
    slug: "pedro-superti",
    name: "Pedro Superti",
    category: "consulting",
    role: "Mentor de líderes visionários",
    description:
      "Marketing de diferenciação, vendas e posicionamento.",
    status: "coming-soon",
  },
  {
    slug: "phibonacci",
    name: "Phibonacci",
    category: "branding-design",
    role: "Branding e design premium",
    description: "Marcas estratégicas com alta percepção de valor.",
    status: "coming-soon",
  },
  {
    slug: "pizzarium",
    name: "Pizzarium",
    category: "food-beverage",
    role: "Pizzaria artesanal",
    description: "Delivery no sul da ilha e campeã nacional pela FISPAL.",
    status: "coming-soon",
  },
  {
    slug: "purefoods",
    name: "Purefoods",
    category: "food-beverage",
    role: "Alimentação saudável",
    description: "Refeições naturais, práticas e bem feitas.",
    status: "coming-soon",
  },
  {
    slug: "renan-umpierre",
    name: "Renan Umpierre",
    category: "consulting",
    role: "Branding estratégico",
    description: "Arquitetura de marca, percepção e experiência.",
    status: "coming-soon",
  },
  {
    slug: "rhai",
    name: "Rhai",
    category: "creator",
    role: "Criadora e comunicadora",
    description:
      "Sabedoria feminina, maturidade emocional e posicionamento.",
    status: "coming-soon",
  },
  {
    slug: "roberta-olsen",
    name: "Roberta Olsen",
    category: "consulting",
    role: "Terapeuta integrativa",
    description: "Autoconhecimento, comportamento e saúde emocional.",
    status: "coming-soon",
  },
  {
    slug: "semantix",
    name: "Semantix",
    category: "technology",
    role: "IA, dados e analytics",
    description: "Soluções de inteligência artificial para empresas.",
    status: "coming-soon",
  },
  {
    slug: "unna",
    name: "Unna",
    category: "real-estate",
    role: "Real estate no Canadá",
    description:
      "Compra, venda e experiência imobiliária em Toronto e GTA.",
    status: "coming-soon",
  },
  {
    slug: "vanessa-luchi",
    name: "Vanessa Luchi",
    category: "health-wellbeing",
    role: "Nutricionista",
    description:
      "Saúde intestinal, nutrição esportiva e emagrecimento.",
    status: "coming-soon",
  },
  {
    slug: "venusto",
    name: "Venusto",
    category: "fashion-retail",
    role: "Marca de roupas",
    description:
      "Streetwear brasileiro com identidade urbana contemporânea.",
    status: "coming-soon",
  },
  {
    slug: "wave",
    name: "Wave",
    category: "marketing",
    role: "Marketing digital",
    description: "Performance, tráfego e crescimento digital.",
    status: "coming-soon",
  },
  {
    slug: "yasmin-nobrega",
    name: "Yasmin Nóbrega",
    category: "consulting",
    role: "Eficiência e IA para negócios",
    description:
      "Estratégia, automação e crescimento com inteligência artificial.",
    status: "coming-soon",
  },
];

export function getClientEntry(slug: string): ClientEntry | undefined {
  return clientsDirectory.find((c) => c.slug === slug);
}
