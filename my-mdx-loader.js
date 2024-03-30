const mdxLoader = require('@mdx-js/loader')
const rehypePrism = require('@mapbox/rehype-prism')
 
module.exports = function (code) {
  const prevGetOptions = this.getOptions.bind(this)
  this.getOptions = function getOptions(...args) {
    return {
      ...prevGetOptions(...args),
      rehypePlugins: [rehypePrism],
    }
  }
 
  mdxLoader.call(this, code)
}