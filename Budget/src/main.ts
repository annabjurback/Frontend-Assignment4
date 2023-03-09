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
            filterOptions: {
                category: "all",
                minimumAmount: 0,
                maximumAmount: 99999999
            },
<<<<<<< HEAD
            maxAmount: 1,
            minimumPrice: 0,
            maximumPrice: 1,
=======
            filterSelect: "all",
            maxAmount: 0,
            minimumCostMax: 0,
            maximumCostMin: 1000
>>>>>>> d056772031242cf2e800a98dbf466107be194a23

            
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
            this.setMaxAmount();
        },
        deleteExpense(index: number) {
            this.expenses.splice(index, 1);
        },
        filterExpenses() {
            let dummy;
            if(this.filterOptions.category === "all"){
                dummy = this.expenses.slice();
            }
            else {
                dummy = this.expenses.filter((ex: { category: string; }) => ex.category === this.filterOptions.category);
            }

<<<<<<< HEAD
            return this.dummy;
        },
        setMaxAmount() {
            this.maxAmount = Math.max(this.expenses.map((ex: {amount: number}) => ex.amount));
=======
            return dummy;
        },
        applyFilter() {
            this.filterOptions.category = this.filterSelect;
>>>>>>> d056772031242cf2e800a98dbf466107be194a23
        }
    }
}).mount('#app')
