import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 48, fontSize: 10.5, lineHeight: 1.5, color: "#1d2430" },
  title: { fontSize: 15, fontWeight: 700, textAlign: "center", marginBottom: 4 },
  subtitle: { fontSize: 9, textAlign: "center", color: "#57626f", marginBottom: 20 },
  paragraph: { marginBottom: 8 },
  clauseTitle: { fontSize: 10.5, fontWeight: 700, marginTop: 14, marginBottom: 6, color: "#052659" },
  item: { marginBottom: 5 },
  bullet: { marginLeft: 12, marginBottom: 3 },
  signRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 40 },
  signBlock: { width: "45%", borderTopWidth: 1, borderTopColor: "#1d2430", paddingTop: 6 },
  signName: { fontWeight: 700 },
  signRole: { color: "#57626f", fontSize: 9 },
});

export type ContratoPdfProps = {
  clienteNome: string;
  clienteCpfCnpj: string;
  clienteCidadeUf: string;
  precoFormatado?: string;
  desconto?: number;
  valorFormatado: string;
  valorExtenso: string;
  data: string;
};

export function ContratoPdf({
  clienteNome,
  clienteCpfCnpj,
  clienteCidadeUf,
  precoFormatado,
  desconto,
  valorFormatado,
  valorExtenso,
  data,
}: ContratoPdfProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Contrato de Prestação de Serviços</Text>
        <Text style={styles.subtitle}>Presença Digital Premium</Text>

        <Text style={styles.paragraph}>Pelo presente instrumento particular, de um lado:</Text>
        <Text style={styles.paragraph}>
          CONTRATADA: Ricardo Steinmetz Scherdien, brasileiro, empresário, portador do CPF nº
          040.516.420-38, domiciliado na Rua Santa Cruz, nº 1470, Pelotas/RS, atuando sob o nome
          fantasia &quot;Espectra&quot;, doravante denominado simplesmente CONTRATADA;
        </Text>
        <Text style={styles.paragraph}>e de outro lado:</Text>
        <Text style={styles.paragraph}>
          CONTRATANTE: {clienteNome}, portador(a) do CPF/CNPJ nº {clienteCpfCnpj},
          residente/sediado(a) em {clienteCidadeUf}, doravante denominado(a) simplesmente
          CONTRATANTE;
        </Text>
        <Text style={styles.paragraph}>
          resolvem celebrar o presente Contrato de Prestação de Serviços, que se regerá pelas
          cláusulas seguintes.
        </Text>

        <Text style={styles.clauseTitle}>Cláusula 1ª — Do objeto</Text>
        <Text style={styles.item}>
          1.1. O presente contrato tem por objeto a prestação, pela CONTRATADA, de serviços de
          criação e desenvolvimento de uma landing page / site de posicionamento digital
          profissional para o CONTRATANTE, doravante denominado &quot;Projeto&quot;, elaborado a
          partir das informações fornecidas pelo CONTRATANTE em formulário de briefing próprio da
          CONTRATADA.
        </Text>
        <Text style={styles.item}>1.2. O escopo do Projeto compreende:</Text>
        <Text style={styles.bullet}>
          • Definição de identidade visual e estrutura da página, com base nas informações do
          briefing;
        </Text>
        <Text style={styles.bullet}>
          • Desenvolvimento e publicação de uma landing page responsiva (computador e celular);
        </Text>
        <Text style={styles.bullet}>
          • Alterações ilimitadas dentro do prazo previsto na Cláusula 5ª;
        </Text>
        <Text style={styles.bullet}>
          • Orientação básica para configuração de domínio e hospedagem.
        </Text>
        <Text style={styles.item}>
          1.3. Não estão incluídos neste escopo, salvo acordo expresso em contrário: produção de
          conteúdo/textos além do briefing, sessão de fotos profissional, tráfego pago/gestão de
          anúncios, manutenção mensal após a entrega, e alterações estruturais fora do briefing
          original.
        </Text>

        <Text style={styles.clauseTitle}>Cláusula 2ª — Do prazo</Text>
        <Text style={styles.item}>
          2.1. O prazo estimado de entrega do Projeto é de até 2 (dois) dias corridos, contados a
          partir do recebimento completo do briefing e da confirmação do pagamento (ou primeira
          parcela, conforme Cláusula 3ª).
        </Text>
        <Text style={styles.item}>
          2.2. O prazo poderá ser prorrogado, sem qualquer penalidade à CONTRATADA, na exata
          medida do atraso causado por: (i) demora do CONTRATANTE em fornecer informações,
          materiais ou aprovações; (ii) pedidos de alteração de escopo não previstos no briefing
          original.
        </Text>

        <Text style={styles.clauseTitle}>Cláusula 3ª — Do valor e da forma de pagamento</Text>
        <Text style={styles.item}>
          {desconto && precoFormatado
            ? `3.1. Pelos serviços objeto deste contrato, o CONTRATANTE pagará à CONTRATADA o valor de R$ ${precoFormatado}, com desconto de ${desconto}%, totalizando o valor de R$ ${valorFormatado} (${valorExtenso}).`
            : `3.1. Pelos serviços objeto deste contrato, o CONTRATANTE pagará à CONTRATADA o valor total de R$ ${valorFormatado} (${valorExtenso}).`}
        </Text>
        <Text style={styles.item}>
          3.2. O pagamento poderá ser realizado à vista ou parcelado em até 12 (doze) vezes,
          conforme as condições disponíveis na plataforma de pagamento indicada pela CONTRATADA.
        </Text>
        <Text style={styles.item}>
          3.3. A produção do Projeto tem início somente após a confirmação do pagamento (ou da
          primeira parcela, quando parcelado).
        </Text>
        <Text style={styles.item}>
          3.4. Em caso de atraso no pagamento, incidirão multa moratória de 2% sobre o valor em
          atraso, juros de mora de 1% ao mês, e correção monetária pelo índice IPCA, sem prejuízo
          da suspensão da execução do Projeto até a regularização.
        </Text>
        <Text style={styles.item}>
          3.5. Os preços e formas de pagamento praticados pela CONTRATADA estão sujeitos aos
          valores vigentes em sua tabela comercial no momento da contratação.
        </Text>

        <Text style={styles.clauseTitle}>Cláusula 4ª — Da aprovação final e conclusão do projeto</Text>
        <Text style={styles.item}>
          4.1. Após a aprovação expressa da versão final pelo CONTRATANTE — por escrito, e-mail,
          WhatsApp ou na plataforma utilizada pela CONTRATADA —, ou após o decurso do prazo
          previsto na Cláusula 5ª, o Projeto será considerado concluído e entregue, não sendo
          devidas alterações adicionais sem novo orçamento, ressalvado o disposto na Cláusula 9ª
          (Garantia).
        </Text>

        <Text style={styles.clauseTitle}>Cláusula 5ª — Das revisões e alterações</Text>
        <Text style={styles.item}>
          5.1. O CONTRATANTE terá direito a solicitar alterações ilimitadas na página entregue,
          dentro do escopo definido no briefing, durante o prazo de 7 (sete) dias corridos
          contados da apresentação da primeira versão.
        </Text>
        <Text style={styles.item}>
          5.2. Encerrado o prazo da Cláusula 5.1, cada alteração adicional solicitada será orçada
          individualmente pela CONTRATADA, conforme a complexidade e o trabalho exigido, e cobrada
          à parte.
        </Text>
        <Text style={styles.item}>
          5.3. Independentemente do prazo da Cláusula 5.1, não se consideram alteração dentro do
          escopo, estando sempre sujeitas a orçamento próprio: mudanças de identidade visual,
          estrutura ou escopo diferentes do que foi originalmente briefado e aprovado.
        </Text>

        <Text style={styles.clauseTitle}>Cláusula 6ª — Da interrupção do projeto pelo contratante</Text>
        <Text style={styles.item}>
          6.1. Caso o CONTRATANTE permaneça sem responder solicitações, materiais ou aprovações
          pendentes por período superior a 30 (trinta) dias corridos, o Projeto será considerado
          interrompido por iniciativa do CONTRATANTE, podendo ser encerrado pela CONTRATADA a
          qualquer momento, sem devolução dos valores já pagos, aplicando-se ainda o disposto na
          Cláusula 18ª (Rescisão) no que couber.
        </Text>
      </Page>

      <Page size="A4" style={styles.page}>
        <Text style={styles.clauseTitle}>Cláusula 7ª — Do domínio</Text>
        <Text style={styles.item}>
          7.1. O registro e a renovação do domínio (endereço do site) são de responsabilidade do
          CONTRATANTE, titular exclusivo do domínio, salvo contratação específica em contrário.
        </Text>

        <Text style={styles.clauseTitle}>Cláusula 8ª — Da hospedagem</Text>
        <Text style={styles.item}>
          8.1. A hospedagem do Projeto poderá ser realizada em conta própria do CONTRATANTE ou
          fornecida pela CONTRATADA, conforme acordado entre as partes.
        </Text>
        <Text style={styles.item}>
          8.2. Caso a hospedagem seja fornecida pela CONTRATADA, eventuais mensalidades ou custos
          de manutenção serão cobrados separadamente do valor previsto na Cláusula 3ª.
        </Text>

        <Text style={styles.clauseTitle}>Cláusula 9ª — Da garantia</Text>
        <Text style={styles.item}>
          9.1. A CONTRATADA garante a correção de eventuais bugs/defeitos técnicos de
          funcionamento da página entregue pelo prazo de 7 (sete) dias corridos contados da data
          de publicação, sem custo adicional.
        </Text>
        <Text style={styles.item}>
          9.2. A garantia não cobre alterações de conteúdo, design ou funcionalidades não
          incluídas no escopo original, tampouco problemas decorrentes de alterações feitas por
          terceiros após a entrega.
        </Text>

        <Text style={styles.clauseTitle}>Cláusula 10ª — Dos materiais fornecidos pelo contratante</Text>
        <Text style={styles.item}>
          10.1. O CONTRATANTE declara possuir os direitos necessários sobre fotos, logotipos,
          marcas, textos, depoimentos e demais materiais enviados à CONTRATADA para uso no
          Projeto, responsabilizando-se integralmente por eventual violação de direitos de
          terceiros decorrente desses materiais.
        </Text>
        <Text style={styles.item}>
          10.2. Após a entrega do Projeto, é responsabilidade do CONTRATANTE manter cópia de
          segurança (backup) dos materiais e arquivos disponibilizados.
        </Text>

        <Text style={styles.clauseTitle}>Cláusula 11ª — De SEO e resultados</Text>
        <Text style={styles.item}>
          11.1. A CONTRATADA aplica boas práticas de SEO técnico, não garantindo posicionamento
          específico, colocação em primeiro lugar ou qualquer classificação determinada nos
          resultados de busca.
        </Text>
        <Text style={styles.item}>
          11.2. A CONTRATADA não garante aumento de faturamento, geração de clientes ou quaisquer
          resultados comerciais específicos decorrentes do Projeto, uma vez que tais fatores
          dependem de variáveis externas, como mercado, concorrência, divulgação e atuação do
          próprio CONTRATANTE.
        </Text>

        <Text style={styles.clauseTitle}>Cláusula 12ª — Da propriedade intelectual</Text>
        <Text style={styles.item}>
          12.1. Após a quitação integral do valor previsto na Cláusula 3ª, os direitos de uso
          sobre o layout final e o conteúdo da página desenvolvida serão transferidos ao
          CONTRATANTE.
        </Text>
        <Text style={styles.item}>
          12.2. A CONTRATADA reserva-se o direito de exibir o Projeto desenvolvido em seu
          portfólio, materiais de divulgação e redes sociais, salvo manifestação expressa em
          contrário do CONTRATANTE, por escrito.
        </Text>
        <Text style={styles.item}>
          12.3. Elementos de propriedade da CONTRATADA (metodologia interna, templates-base,
          componentes reutilizáveis não exclusivos) permanecem de sua titularidade.
        </Text>

        <Text style={styles.clauseTitle}>Cláusula 13ª — De alterações e melhorias futuras</Text>
        <Text style={styles.item}>
          13.1. Quaisquer alterações, novos recursos ou melhorias solicitados após a conclusão do
          Projeto (Cláusula 4ª) constituem novo serviço, e poderão ser orçados e cobrados conforme
          a tabela vigente da CONTRATADA à época da solicitação.
        </Text>

        <Text style={styles.clauseTitle}>Cláusula 14ª — Da confidencialidade e proteção de dados (LGPD)</Text>
        <Text style={styles.item}>
          14.1. As partes se comprometem a manter sigilo sobre informações confidenciais trocadas
          durante a execução deste contrato.
        </Text>
        <Text style={styles.item}>
          14.2. A CONTRATADA tratará os dados pessoais fornecidos pelo CONTRATANTE exclusivamente
          para a finalidade de execução deste contrato, em conformidade com a Lei Geral de
          Proteção de Dados (Lei nº 13.709/2018), não os compartilhando com terceiros sem
          consentimento, exceto quando exigido por lei.
        </Text>

        <Text style={styles.clauseTitle}>Cláusula 15ª — Da comunicação e das aprovações</Text>
        <Text style={styles.item}>
          15.1. Todas as solicitações, aprovações e comunicações entre as partes poderão ocorrer
          validamente por WhatsApp, e-mail, ou pela plataforma/CRM utilizado pela CONTRATADA,
          sendo tais registros considerados prova suficiente do combinado entre as partes.
        </Text>

        <Text style={styles.clauseTitle}>Cláusula 16ª — De caso fortuito e força maior</Text>
        <Text style={styles.item}>
          16.1. Nenhuma das partes será responsabilizada por atrasos ou falhas na execução deste
          contrato decorrentes de caso fortuito ou força maior.
        </Text>

        <Text style={styles.clauseTitle}>Cláusula 17ª — De serviços de terceiros</Text>
        <Text style={styles.item}>
          17.1. O Projeto pode depender de provedores de hospedagem, domínio, e-mail e outros
          serviços de terceiros. Eventuais alterações, indisponibilidades ou mudanças de política
          desses provedores não são de responsabilidade da CONTRATADA.
        </Text>

        <Text style={styles.clauseTitle}>Cláusula 18ª — Da rescisão e do cancelamento</Text>
        <Text style={styles.item}>
          18.1. Este contrato poderá ser rescindido por qualquer das partes, mediante comunicação
          por escrito, em caso de descumprimento não sanado em até 15 (quinze) dias corridos após
          notificação, mútuo acordo, ou interrupção pelo CONTRATANTE nos termos da Cláusula 6ª.
        </Text>
        <Text style={styles.item}>
          18.2. Em caso de rescisão ou cancelamento após o início da execução do Projeto, os
          valores já pagos referentes a serviços já executados não serão reembolsados, sendo
          devido pelo CONTRATANTE o valor proporcional aos serviços executados até a data da
          rescisão.
        </Text>

        <Text style={styles.clauseTitle}>Cláusula 19ª — Da assinatura eletrônica</Text>
        <Text style={styles.item}>
          19.1. As partes reconhecem como válida a assinatura deste instrumento por meio
          eletrônico, nos termos do art. 10, §2º, da Medida Provisória nº 2.200-2/2001.
        </Text>

        <Text style={styles.clauseTitle}>Cláusula 20ª — Do foro</Text>
        <Text style={styles.item}>
          20.1. Fica eleito o foro da Comarca de Pelotas/RS para dirimir quaisquer controvérsias
          oriundas deste contrato, com renúncia expressa a qualquer outro, por mais privilegiado
          que seja.
        </Text>

        <Text style={styles.paragraph}>
          E por estarem justas e contratadas, as partes assinam o presente instrumento, de forma
          eletrônica, na data abaixo.
        </Text>
        <Text style={styles.paragraph}>Pelotas/RS, {data}</Text>

        <View style={styles.signRow}>
          <View style={styles.signBlock}>
            <Text style={styles.signName}>Ricardo Steinmetz Scherdien</Text>
            <Text style={styles.signRole}>CONTRATADA</Text>
          </View>
          <View style={styles.signBlock}>
            <Text style={styles.signName}>{clienteNome}</Text>
            <Text style={styles.signRole}>CONTRATANTE</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
