export const ESPECTRA_COORDS: [number, number] = [-31.7722, -52.3426]; // Pelotas, RS

const CITY_COORDS: Record<string, [number, number]> = {
  // Rio Grande do Sul
  "pelotas": [-31.7722, -52.3426],
  "porto alegre": [-30.0346, -51.2177],
  "caxias do sul": [-29.1678, -51.1794],
  "canoas": [-29.9178, -51.1828],
  "santa maria": [-29.6869, -53.8069],
  "gravataí": [-29.9444, -51.0325],
  "viamão": [-30.0811, -51.0233],
  "novo hamburgo": [-29.6783, -51.1306],
  "são leopoldo": [-29.7600, -51.1469],
  "passo fundo": [-28.2631, -52.4069],
  "rio grande": [-32.0350, -52.0986],
  "bagé": [-31.3308, -54.1069],
  "uruguaiana": [-29.7542, -57.0881],
  "santa cruz do sul": [-29.7175, -52.4256],
  "lajeado": [-29.4664, -51.9611],
  "alvorada": [-30.0133, -51.0825],
  "sapucaia do sul": [-29.8286, -51.1481],
  "erechim": [-27.6350, -52.2736],
  "cachoeirinha": [-29.9500, -51.0944],
  "são lourenço do sul": [-31.3667, -51.9833],
  "camaquã": [-30.8500, -51.8167],
  "alegrete": [-29.7833, -55.7931],
  "ijuí": [-28.3878, -53.9147],
  "bento gonçalves": [-29.1728, -51.5194],
  "vacaria": [-28.5122, -50.9339],
  "capão da canoa": [-29.7500, -50.0167],
  "torres": [-29.3333, -49.7333],
  "tramandaí": [-30.0000, -50.1333],
  "osório": [-29.8856, -50.2683],
  "farroupilha": [-29.2231, -51.3511],
  "frederico westphalen": [-27.3592, -53.3953],
  "santiago": [-29.1894, -54.8708],
  "guaíba": [-30.1108, -51.3244],
  "charqueadas": [-29.9553, -51.6253],
  "taquara": [-29.6500, -50.7833],
  "sapiranga": [-29.6383, -51.0028],
  "cachoeira do sul": [-30.0361, -52.8897],
  "venâncio aires": [-29.6106, -52.1897],
  "garibaldi": [-29.2553, -51.5317],
  "montenegro": [-29.6878, -51.4619],
  "santa rosa": [-27.8700, -54.4817],
  "três passos": [-27.4553, -53.9278],
  "horizontina": [-27.6231, -54.3069],
  "santo ângelo": [-28.2994, -54.2631],
  "palmeira das missões": [-27.8983, -53.3144],
  "carazinho": [-28.2833, -52.7878],
  "marau": [-28.4500, -52.2000],
  "soledade": [-28.8178, -52.5094],
  "encantado": [-29.2333, -51.8667],
  "veranópolis": [-28.9358, -51.5511],
  "flores da cunha": [-29.0278, -51.1817],
  "carlos barbosa": [-29.2956, -51.4969],
  "arroio do meio": [-29.3992, -51.9375],
  "triunfo": [-29.9386, -51.7228],
  "general câmara": [-29.8953, -51.7889],

  // Santa Catarina
  "florianópolis": [-27.5954, -48.5480],
  "joinville": [-26.3045, -48.8487],
  "blumenau": [-26.9194, -49.0661],
  "chapecó": [-27.1003, -52.6156],
  "criciúma": [-28.6775, -49.3697],
  "itajaí": [-26.9078, -48.6619],
  "jaraguá do sul": [-26.4853, -49.0719],
  "palhoça": [-27.6453, -48.6669],
  "são josé": [-27.5942, -48.6353],
  "lages": [-27.8158, -50.3261],
  "balneário camboriú": [-26.9903, -48.6347],

  // Paraná
  "curitiba": [-25.4284, -49.2733],
  "londrina": [-23.3045, -51.1696],
  "maringá": [-23.4273, -51.9375],
  "ponta grossa": [-25.0994, -50.1583],
  "cascavel": [-24.9558, -53.4553],
  "foz do iguaçu": [-25.5478, -54.5882],
  "são josé dos pinhais": [-25.5350, -49.2064],
  "colombo": [-25.2919, -49.2242],
  "guarapuava": [-25.3878, -51.4578],
  "paranaguá": [-25.5203, -48.5097],

  // São Paulo
  "são paulo": [-23.5505, -46.6333],
  "campinas": [-22.9099, -47.0626],
  "guarulhos": [-23.4628, -46.5333],
  "são bernardo do campo": [-23.6939, -46.5650],
  "santo andré": [-23.6639, -46.5383],
  "osasco": [-23.5325, -46.7919],
  "sorocaba": [-23.5015, -47.4526],
  "ribeirão preto": [-21.1775, -47.8103],
  "mauá": [-23.6678, -46.4608],
  "santos": [-23.9608, -46.3336],
  "diadema": [-23.6861, -46.6228],
  "mogi das cruzes": [-23.5228, -46.1875],
  "jundiaí": [-23.1864, -46.8964],
  "piracicaba": [-22.7250, -47.6486],
  "bauru": [-22.3139, -49.0608],
  "são josé do rio preto": [-20.8197, -49.3797],
  "limeira": [-22.5644, -47.4017],
  "carapicuíba": [-23.5239, -46.8358],
  "franca": [-20.5386, -47.4008],

  // Rio de Janeiro
  "rio de janeiro": [-22.9068, -43.1729],
  "niterói": [-22.8833, -43.1036],
  "nova iguaçu": [-22.7592, -43.4511],
  "duque de caxias": [-22.7856, -43.3117],
  "belford roxo": [-22.7642, -43.3994],
  "petrópolis": [-22.5050, -43.1786],
  "volta redonda": [-22.5231, -44.1044],

  // Minas Gerais
  "belo horizonte": [-19.9167, -43.9345],
  "uberlândia": [-18.9186, -48.2772],
  "contagem": [-19.9317, -44.0536],
  "juiz de fora": [-21.7642, -43.3503],
  "betim": [-19.9667, -44.1978],
  "montes claros": [-16.7289, -43.8647],
  "ribeirão das neves": [-19.7650, -44.0850],
  "ipatinga": [-19.4683, -42.5369],
  "sete lagoas": [-19.4683, -44.2472],

  // Bahia
  "salvador": [-12.9714, -38.5014],
  "feira de santana": [-12.2664, -38.9669],
  "vitória da conquista": [-14.8661, -40.8444],
  "camaçari": [-12.6997, -38.3236],
  "itabuna": [-14.7867, -39.2806],

  // Pernambuco
  "recife": [-8.0522, -34.9286],
  "jaboatão dos guararapes": [-8.1131, -35.0147],
  "olinda": [-7.9986, -34.8489],
  "caruaru": [-8.2789, -35.9761],
  "petrolina": [-9.3997, -40.4997],

  // Ceará
  "fortaleza": [-3.7172, -38.5433],
  "caucaia": [-3.7253, -38.6531],
  "juazeiro do norte": [-7.2131, -39.3153],
  "maracanaú": [-3.8792, -38.6264],

  // Goiás
  "goiânia": [-16.6864, -49.2643],
  "aparecida de goiânia": [-16.8231, -49.2439],
  "anápolis": [-16.3281, -48.9531],

  // Distrito Federal
  "brasília": [-15.7801, -47.9292],
  "distrito federal": [-15.7801, -47.9292],

  // Mato Grosso do Sul
  "campo grande": [-20.4428, -54.6460],
  "dourados": [-22.2211, -54.8056],

  // Mato Grosso
  "cuiabá": [-15.6014, -56.0979],
  "várzea grande": [-15.6461, -56.1322],

  // Pará
  "belém": [-1.4558, -48.5044],
  "ananindeua": [-1.3658, -48.3722],
  "santarém": [-2.4297, -54.7083],

  // Amazonas
  "manaus": [-3.1019, -60.0250],

  // Maranhão
  "são luís": [-2.5297, -44.3028],
  "imperatriz": [-5.5261, -47.4917],

  // Piauí
  "teresina": [-5.0892, -42.8019],

  // Rio Grande do Norte
  "natal": [-5.7945, -35.2110],
  "mossoró": [-5.1878, -37.3442],

  // Paraíba
  "joão pessoa": [-7.1153, -34.8641],
  "campina grande": [-7.2306, -35.8811],

  // Alagoas
  "maceió": [-9.6658, -35.7353],

  // Sergipe
  "aracaju": [-10.9472, -37.0731],

  // Espírito Santo
  "vitória": [-20.3155, -40.3128],
  "serra": [-20.1283, -40.3075],
  "vila velha": [-20.3297, -40.2922],
  "cariacica": [-20.2633, -40.4175],

  // Rondônia
  "porto velho": [-8.7612, -63.9004],

  // Tocantins
  "palmas": [-10.2491, -48.3243],

  // Acre
  "rio branco": [-9.9758, -67.8243],

  // Amapá
  "macapá": [0.0356, -51.0705],

  // Roraima
  "boa vista": [2.8197, -60.6733],
};

const STATE_COORDS: Record<string, [number, number]> = {
  AC: [-9.0238, -70.8120],
  AL: [-9.5713, -36.7820],
  AP: [1.4102, -51.7703],
  AM: [-3.4168, -65.8561],
  BA: [-12.5797, -41.7007],
  CE: [-5.4984, -39.3206],
  DF: [-15.7801, -47.9292],
  ES: [-19.1834, -40.3089],
  GO: [-15.8270, -49.8362],
  MA: [-5.4220, -45.4441],
  MT: [-12.6819, -56.9211],
  MS: [-20.7722, -54.7852],
  MG: [-18.5122, -44.5550],
  PA: [-3.4168, -52.0000],
  PB: [-7.2399, -36.7819],
  PR: [-24.8893, -51.2082],
  PE: [-8.8137, -36.9541],
  PI: [-7.7183, -42.7289],
  RJ: [-22.2509, -42.5659],
  RN: [-5.8127, -36.2032],
  RS: [-30.0346, -51.2177],
  RO: [-10.8308, -63.8364],
  RR: [1.9900, -61.3300],
  SC: [-27.2423, -50.2189],
  SP: [-22.2523, -48.8052],
  SE: [-10.5741, -37.3857],
  TO: [-10.1753, -48.2982],
};

export type Precisao = "exata" | "aproximada";

export function getCoords(
  cidade: string | null,
  estado: string | null,
): { coords: [number, number]; precisao: Precisao } | null {
  if (!cidade && !estado) return null;
  if (cidade) {
    const key = cidade.trim().toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
    for (const [k, coords] of Object.entries(CITY_COORDS)) {
      const normalized = k.normalize("NFD").replace(/\p{Diacritic}/gu, "");
      if (normalized === key) return { coords, precisao: "exata" };
    }
    // Partial match — pode acertar uma cidade parecida mas errada, então conta como aproximado
    for (const [k, coords] of Object.entries(CITY_COORDS)) {
      const normalized = k.normalize("NFD").replace(/\p{Diacritic}/gu, "");
      if (normalized.includes(key) || key.includes(normalized)) return { coords, precisao: "aproximada" };
    }
  }
  if (estado) {
    const coords = STATE_COORDS[estado.toUpperCase()];
    if (coords) return { coords, precisao: "aproximada" };
  }
  return null;
}
