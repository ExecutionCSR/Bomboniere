export type Product = {
  id: string;
  code: number;
  name: string;
  category: "Doces" | "Chicletes" | "Chocolate" | "Salgadinhos" | "Bebidas";
  price: number;
  availableQuantity: number;
  description: string;
  imageUrl: string;
  imageAlt: string;
};

export const productCategories: Product["category"][] = [
  "Doces",
  "Chicletes",
  "Chocolate",
  "Salgadinhos",
  "Bebidas",
];

export const baseProducts: Product[] = [
  {
    id: "doce-batata-doce",
    code: 1,
    name: "Doce de Batata Doce (Mista)",
    category: "Doces",
    price: 2.5,
    availableQuantity: 20,
    description: "Doce tradicional para venda por unidade, ideal para balcao e kits variados.",
    imageUrl: "https://http2.mlstatic.com/D_NQ_NP_2X_937844-MLB79749768627_102024-F.webp",
    imageAlt: "Doce de batata doce em fatias.",
  },
  {
    id: "cliss-tutti-frutti",
    code: 2,
    name: "Florestal Chicle Cliss Tutti Frutti",
    category: "Chicletes",
    price: 1.5,
    availableQuantity: 12,
    description: "Chiclete sabor tutti frutti em embalagem com 12 unidades.",
    imageUrl: "https://static1.efacil.com.br/wcsstore/ExtendedSitesCatalogAssetStore/Imagens/360/4302373_01.jpg",
    imageAlt: "Caixa de chiclete Cliss Tutti Frutti da Florestal.",
  },
  {
    id: "cliss-hortela",
    code: 3,
    name: "Florestal Chicle Cliss Hortela",
    category: "Chicletes",
    price: 1.5,
    availableQuantity: 12,
    description: "Opcao refrescante para consumo rapido e compra por impulso.",
    imageUrl: "https://static1.efacil.com.br/wcsstore/ExtendedSitesCatalogAssetStore/Imagens/360/4302372_01.jpg",
    imageAlt: "Caixa de chiclete Cliss Hortela da Florestal.",
  },
  {
    id: "bala-poosh",
    code: 4,
    name: "Arcor Bala Poosh Tutti Frutti 500g",
    category: "Doces",
    price: 0.25,
    availableQuantity: 100,
    description: "Bala unitaria com boa margem para venda em volume.",
    imageUrl: "https://www.arcor.com.br/wp-content/uploads/2019/07/produto-poosh-bala-tuttifrutti.png",
    imageAlt: "Bala Poosh Tutti Frutti da Arcor.",
  },
  {
    id: "chicle-poosh-morango",
    code: 5,
    name: "Arcor Chicle Poosh Morango",
    category: "Chicletes",
    price: 0.5,
    availableQuantity: 40,
    description: "Chiclete de morango para mix de caixa com itens de baixo ticket.",
    imageUrl: "https://static.welban.com.br/public/welban/imagens/produtos/chiclete-poosh-morango-40-unidades-arcor-668309ede2b02.jpg",
    imageAlt: "Chiclete Poosh Morango da Arcor.",
  },
  {
    id: "chicle-poosh-tutti",
    code: 6,
    name: "Arcor Chicle Poosh Tutti Frutti",
    category: "Chicletes",
    price: 0.5,
    availableQuantity: 40,
    description: "Versao tutti frutti para montar linha de impulso colorida e acessivel.",
    imageUrl: "https://www.arcor.com.br/wp-content/uploads/2019/07/1.-Poosh-Tutti-Frutti-1.png",
    imageAlt: "Chiclete Poosh Tutti Frutti da Arcor.",
  },
  {
    id: "trento-massimo",
    code: 7,
    name: "Wafer Trento Massimo Chocolate",
    category: "Chocolate",
    price: 3,
    availableQuantity: 15,
    description: "Chocolate premium para destacar na secao de maior valor percebido.",
    imageUrl: "https://zaffari.vtexassets.com/arquivos/ids/243973-800-auto?aspect=true&height=auto&v=638369479185970000&width=800",
    imageAlt: "Chocolate Trento Massimo sabor chocolate.",
  },
  {
    id: "salgado-cebola",
    code: 10,
    name: "Salgado de Cebola Fofura",
    category: "Salgadinhos",
    price: 3,
    availableQuantity: 10,
    description: "Salgadinho de pacote para complementar o mix doce com consumo rapido.",
    imageUrl: "https://cdn.awsli.com.br/600x1000/1957/1957771/produto/104775150/fofura-cebola-ki4gmascr0.png",
    imageAlt: "Pacote de salgadinho Fofura sabor cebola.",
  },
  {
    id: "salgado-churrasco",
    code: 11,
    name: "Salgado de Churrasco Fofura",
    category: "Salgadinhos",
    price: 3,
    availableQuantity: 10,
    description: "Variacao sabor churrasco para ampliar a escolha no balcao.",
    imageUrl: "https://cdn.awsli.com.br/600x1000/1957/1957771/produto/1047751520643646f74.jpg",
    imageAlt: "Pacote de salgadinho Fofura sabor churrasco.",
  },
  {
    id: "coca-cola-200",
    code: 12,
    name: "Coca-Cola 200 ml",
    category: "Bebidas",
    price: 2,
    availableQuantity: 10,
    description: "Bebida gelada de apoio ao combo com doces e salgados.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Coca-Cola_200ml_glass_bottle_20080201.jpg/500px-Coca-Cola_200ml_glass_bottle_20080201.jpg?_=20100604123941",
    imageAlt: "Garrafa de Coca-Cola 200 ml.",
  },
  {
    id: "pacoca",
    code: 14,
    name: "Pacoca",
    category: "Doces",
    price: 1,
    availableQuantity: 20,
    description: "Item popular e barato para girar rapido no caixa.",
    imageUrl: "https://a-static.mlcdn.com.br/420x420/pacoca-pacoquita-rolha-redonda-caixa-com-100-unidades-santa-helena/mbcomercioedistribuicao/9972554365/1cf0563515713a77ddb3114191a5e69c.jpeg",
    imageAlt: "Caixa de pacoca tipo rolha.",
  },
];
