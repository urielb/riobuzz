TODO-LIST

* - Refazer geo referencia nos pontos de parada, mudar de array para object

1) Processar os dados de pontos de parada com base nos trajetos de ida e volta para saber se cada ponto está na trajeto de ida e/ou volta;

2) Considerar que os pontos de saída e chegada (entrada/saída/comutação) devem estar em sequência e dentro de um mesmo trajeto;

3) Garantir que os cálculos de distância estejam em Km e que o máximo de distância andado (saída + comutação + chegada) seja menor do que X Km, definindo-se X inicialmente como 0,5 Km;

4) Ao invés de apresentar os ônibus em uma caixa de diálogo, apresentar cada caminho como uma polyline no mapa, limitando até 3 caminhos. Cada caminho deve ser pintado de uma cor diferente. O caminho deve ser traçado de acordo com a rota do ônibus ou, se esta não estiver disponível, de acordo com seus pontos de parada. Em cada caminho, colocar uma label com os ônibus envolvidos e destacar os pontos de comutação.

5) Em relação aos pontos de comutação, selecionar apenas aquele com menor distância andando. Sortear um ponto de comutação no caso de diversos com distância zero. Apresentar o ponto em que o usuário deve descer de um ônibus e o ponto em que ele pega o outro ônibus.

6) Escrever o capítulo 2 do projeto final (falar sobre os dados livres dos ônibus)