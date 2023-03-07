import { createApp } from 'vue/dist/vue.esm-bundler';
// import App from './App.vue'


// import './assets/main.css'

const app = createApp({
    data() {
        return{
            counter: 0
        } 
    }
}).mount('#app')
