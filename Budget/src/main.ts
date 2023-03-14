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
            expense: "" as string,
            amount: 0 as number,
            category: "" as string,
            date: new Date().toISOString().substring(0, 10) as string,
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
            },
            {
                expense: "Dog2",
                amount: 124,
                category: "entertainment",
                date: new Date().toISOString().substring(0, 10),
                edit: false
            } as { expense: string, amount: number, category: string, edit: boolean, date: string }],
            filterOptions: {
                category: "all",
                month: "",
                minimumAmount: 0,
                maximumAmount: 0
            } as {category: string, month: string, minimumAmount:number, maximumAmount: number},
            filterSelect: "all" as string,
            selectedMonth: "" as string,
            minimumAmountSelect: 0 as number,
            maximumAmountSelect: 0 as number,
            maxAmountForSliders: 0 as number,
        }
    },
    methods: {
        addExpense() {
            // Tillagt sent 14 mars, Anna testar
            window.localStorage.setItem('expenses', JSON.stringify(this.expenses));
            this.expenses = window.localStorage.getItem('expenses');
            this.expenses = JSON.parse(this.expenses);

            let newItem = {
                expense: this.expense,
                amount: this.amount,
                category: this.category,
                date: this.date,
                edit: false
            };
            this.expenses.push(newItem);
            this.setMaxAmount();

            // Tillagt sent 14 mars, Anna testar
            window.localStorage.setItem("expenses", JSON.stringify(this.expenses));
        },
        deleteExpense(index: number) {
            this.expenses.splice(index, 1);
            this.setMaximumSliderValue();
            
            // Tillagt sent 14 mars, Anna testar
            window.localStorage.setItem("expenses", JSON.stringify(this.expenses));
        },
        filterExpenses() {
            this.setMaximumSliderValue();

            let dummy;
            if (this.filterOptions.category === "all") {
                dummy = this.expenses.slice();
            }
            else {
                dummy = this.expenses.filter((ex: { category: string; }) => ex.category === this.filterOptions.category);
            }

            // Only applies cost filter if a maximum cost is selected (i.e it is not at 0)
            if (this.filterOptions.maximumAmount !== 0)
            {
                dummy = dummy.filter((ex: {amount: number}) => ex.amount >= this.filterOptions.minimumAmount && ex.amount <= this.filterOptions.maximumAmount);
            }
            
            // If month is not an empty string. Apply month filter.
            if(this.filterOptions !== "") {
                dummy = dummy.filter((ex: { date: string}) => ex.date.includes(this.filterOptions.month));
            }
            return dummy;
        },
        // Sets the highest entered amount for an expense (used for cost filter sliders)
        setMaxAmount() {
            // ChatGPT helped with this one
            this.maxAmountForSliders = this.expenses.reduce((max: number, currentExpense: any) => {
                return currentExpense.amount > max ? currentExpense.amount : max;
            }, 0); 
        },
        // The two methods below keep track of the selected values in the minimum and maximum amount sliders, so that the selected minimum amount cannot exeed selected maximum amount, and vice versa
        setMinimumSliderValue() {
            if (parseInt(this.maximumAmountSelect) < parseInt(this.minimumAmountSelect)) {
                this.minimumAmountSelect = this.maximumAmountSelect;
            }
        },
        setMaximumSliderValue() {
            this.setMaxAmount();
            // If zero is selected, assume the full range
            if(this.maximumAmountSelect === 0)
            {
                this.maximumAmountSelect = parseInt(this.maxAmountForSliders);
            }
            // If selected minimum amount is larger than selected maximum amount, set max to min value 
            if (parseInt(this.minimumAmountSelect) > parseInt(this.maximumAmountSelect)) {
                this.maximumAmountSelect = this.minimumAmountSelect;
            }
            // If current maximum expense is less than selected max, set selected max to current maximum expense 
            if (parseInt(this.maxAmountForSliders) < parseInt(this.maximumAmountSelect))
            {
                this.maximumAmountSelect = parseInt(this.maxAmountForSliders);
            }
        },
        applyFilter() {
            this.filterOptions.category = this.filterSelect;
            this.filterOptions.minimumAmount = this.minimumAmountSelect;
            this.filterOptions.maximumAmount = this.maximumAmountSelect;
            this.filterOptions.month = this.selectedMonth;
        },
        resetFilter() {
            this.filterOptions.category = "all";
            this.filterOptions.minimumAmount = 0;
            this.filterOptions.maximumAmount = this.maxAmountForSliders;
            this.filterOptions.month = "";

            this.filterSelect = "all";
            this.minimumAmountSelect = 0;
            this.maximumAmountSelect = this.maxAmountForSliders;
            this.selectedMonth = "";
            this.filterExpenses();
        },
        capitalize(string: string): string  {
            return string[0].toUpperCase() + string.slice(1);
        }
    }
}).mount('#app')
