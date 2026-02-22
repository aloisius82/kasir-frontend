import VueHtmlToPaper from 'vue-html-to-paper'

const options = {
  name: '_blank',
  specs: ['fullscreen=yes', 'titlebar=yes', 'scrollbars=yes'],
  styles: ['https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css'],
  timeout: 1000,
  autoClose: true,
  windowTitle: window.document.title
}

export const install = (app) => {
  app.use(VueHtmlToPaper, options)
}
