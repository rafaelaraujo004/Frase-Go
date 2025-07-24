# App Frases

## Descrição
O App Frases é uma aplicação web que permite aos usuários visualizar e compartilhar frases inspiradoras. A interface é interativa, permitindo que os usuários gerem novas frases, salvem favoritas e acessem recursos premium.

## Funcionalidades

### Principais
- **Geração de Frases**: Frases inspiradoras categorizadas por temas (motivacional, amor, amizade, felicidade, etc.)
- **Favoritos**: Sistema para salvar e gerenciar frases favoritas
- **Modo Escuro**: Interface adaptável com tema claro e escuro
- **Exportação de Imagem**: Salvar frases como imagem para compartilhamento
- **Sistema de Tags**: Hashtags categorizadas por tema para redes sociais

### Novas Funcionalidades - Imagens de Fundo
- **Galeria por Tema**: 10 imagens de alta qualidade para cada tema disponível
- **Upload Personalizado**: Permite enviar imagens da galeria do dispositivo
- **Controle de Opacidade**: Ajuste da transparência da imagem de fundo (20%, 30%, 50%, 70%)
- **Preservação de Proporções**: Imagem de fundo mantém proporções ideais
- **Persistência**: Configurações de imagem são salvas automaticamente

### Temas Disponíveis
- Motivacional
- Amor
- Amizade
- Felicidade
- Superação
- Gratidão
- Reflexão
- Sucesso
- Família
- Inspiração

## Estrutura do Projeto
O projeto contém os seguintes arquivos:

- **index.html**: Estrutura principal da aplicação, incluindo layout para exibição de frases, botões para interações do usuário e modais para recursos premium.
- **style.css**: Estilos da aplicação, definindo a aparência de elementos como botões, contêineres e modais, garantindo uma interface visualmente atraente.
- **script.js**: Lógica JavaScript da aplicação, gerenciando interações do usuário, como clicar em botões para gerar novas frases, gerenciar favoritos e ativar recursos premium.

## Como Usar

### Configuração
1. Clone o repositório ou baixe os arquivos
2. Abra o arquivo `index.html` em um navegador web

### Interação Básica
- **Gerar Frases**: Use os controles de tema e fonte para personalizar
- **Favoritos**: Clique no coração para salvar frases
- **Modo Escuro**: Toggle no canto superior esquerdo
- **Exportar**: Botão de download para salvar como imagem

### Usar Imagens de Fundo
1. **Abrir Sidebar**: Clique no menu de três linhas (≡) no canto superior direito
2. **Configurar Perfil**: Digite nome e usuário (opcional)
3. **Escolher Imagem**: 
   - Selecione da galeria temática, ou
   - Faça upload de uma imagem personalizada
4. **Ajustar Opacidade**: Use o botão "🔍 Opacidade" para encontrar a transparência ideal
5. **Remover**: Use "🗑️ Remover" para limpar a imagem de fundo

## Tecnologias Utilizadas
- HTML5
- CSS3 (Flexbox, Grid, Media Queries)
- JavaScript (ES6+)
- Unsplash API (para imagens temáticas)
- HTML2Canvas (para exportação de imagens)
- Supabase (autenticação)

## Compatibilidade
- ✅ Desktop (Chrome, Firefox, Safari, Edge)
- ✅ Mobile (iOS Safari, Android Chrome)
- ✅ Tablet (iPad, Android tablets)
- ✅ Touch optimized (44px minimum touch targets)

## Contribuição
Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests.

## Licença
Este projeto é de código aberto e pode ser utilizado e modificado conforme necessário.