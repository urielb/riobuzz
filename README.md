TODO-LIST
* Implement Browserify
* Implement Browser-sync

1) Processar os dados de pontos de parada com base nos trajetos de ida e volta para saber se cada ponto est� na trajeto de ida e/ou volta;

2) Considerar que os pontos de sa�da e chegada (entrada/sa�da/comuta��o) devem estar em sequ�ncia e dentro de um mesmo trajeto;

3) Garantir que os c�lculos de dist�ncia estejam em Km e que o m�ximo de dist�ncia andado (sa�da + comuta��o + chegada) seja menor do que X Km, definindo-se X inicialmente como 0,5 Km;

4) Ao inv�s de apresentar os �nibus em uma caixa de di�logo, apresentar cada caminho como uma polyline no mapa, limitando at� 3 caminhos. Cada caminho deve ser pintado de uma cor diferente. O caminho deve ser tra�ado de acordo com a rota do �nibus ou, se esta n�o estiver dispon�vel, de acordo com seus pontos de parada. Em cada caminho, colocar uma label com os �nibus envolvidos e destacar os pontos de comuta��o.

5) Em rela��o aos pontos de comuta��o, selecionar apenas aquele com menor dist�ncia andando. Sortear um ponto de comuta��o no caso de diversos com dist�ncia zero. Apresentar o ponto em que o usu�rio deve descer de um �nibus e o ponto em que ele pega o outro �nibus.

6) Escrever o cap�tulo 2 do projeto final (falar sobre os dados livres dos �nibus)