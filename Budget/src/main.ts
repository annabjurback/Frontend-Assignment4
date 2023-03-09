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
                "Miscellaneous"
            ],
            expense: "",
            amount: 0,
            category: "",
            date: new Date().toISOString().substring(0, 10),
            expenses: [{
                expense: "Cat",
                amount: 10,
                category: "household",
                date: new Date().toISOString().substring(0, 10),
                edit: false
            },
            {
                expense: "Dog",
                amount: 123,
                category: "entertainment",
                date: new Date().toISOString().substring(0, 10),
                edit: false
            }],
            dummy: [{
                expense: "Cat",
                amount: 10,
                category: "household",
                date: new Date().toISOString().substring(0, 10),
                edit: false
            },
            {
                expense: "Dog",
                amount: 123,
                category: "entertainment",
                date: new Date().toISOString().substring(0, 10),
                edit: false
            }],
            filterOptions: {
                category: "all",
                minimumAmount: 0,
                maximumAmount: 99999999
            },
            maxAmount: 0,
            minimumCostMax: 0,
            maximumCostMin: 1000

            
            // placeholderDate: new Date()
        }
    },
    // watch: {
    //     expenses: {
    //         handler(edit, someEdit) {
    //             this.filterExpenses();
    //         },
    //         deep: true

    //     }
    // },
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
        },
        filterExpenses() {
            if(this.filterOptions.category === "all"){
                this.dummy = this.expenses.slice();
            }
            else {
                this.dummy = this.expenses.filter((ex: { category: string; }) => ex.category === this.filterOptions.category);
            }

            return this.dummy;
        }
    }
}).mount('#app')
