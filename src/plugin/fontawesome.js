import Vue from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { library as faLibrary } from '@fortawesome/fontawesome-svg-core'
import { faAngleDoubleDown, faExternalLinkAlt, faLeaf, faTrophy } from '@fortawesome/free-solid-svg-icons'
import { faGithub } from '@fortawesome/free-brands-svg-icons'

Vue.component('font-awesome-icon', FontAwesomeIcon)

faLibrary.add(faAngleDoubleDown)
faLibrary.add(faExternalLinkAlt)
faLibrary.add(faLeaf)
faLibrary.add(faTrophy)
faLibrary.add(faGithub)
