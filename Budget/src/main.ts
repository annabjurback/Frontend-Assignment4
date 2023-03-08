import { createApp } from 'vue';
// import App from './App.vue'


// import './assets/main.css'

const app = createApp({
    data() {
        return {
            expenseTypes: [
                "Household",
                "Travel",
                "Food",
                "Entertainment",
                "Clothing",
                "Miscellanous"
            ],
            expense: "",
            amount: 0,
            category: "",
            date: "",
            expenses: [],
            // placeholderDate: new Date()
        }
    },
    methods: {
        addExpense() {
            let newItem = {
                expense: this.expense,
                amount: this.amount,
                category: this.category,
                date: this.date,
                edit: false
            };
            this.expenses.push(newItem);
        },
        deleteExpense(index: number) {
            this.expenses.splice(index, 1);
        }
    }
}).mount('#app')
