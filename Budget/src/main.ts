import { createApp } from 'vue';
// import App from './App.vue'


// import './assets/main.css'

interface Expense {
    expense: string;
    amount: number;
    category: string;
    date: string;
    edit: boolean;
    id: number;
};
interface SumPerCategory {
    [key: string]: number;
};

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
            newItem: {
                expense: "",
                amount: 0,
                category: "",
                date: new Date().toISOString().substring(0, 10),
                edit: false,
                id: 0
            } as Expense,
            // expense: "" as string,
            // amount: "",
            // category: "" as string,
            //date: new Date().toISOString().substring(0, 10) as string,
            expenses: [
                //     {
                //         expense: "Cat",
                //         amount: 10,
                //         category: "household",
                //         date: new Date().toISOString().substring(0, 10),
                //         edit: false
                //     },
                //     {
                //         expense: "Dog",
                //         amount: 123,
                //         category: "entertainment",
                //         date: new Date().toISOString().substring(0, 10),
                //         edit: false
                //     },
                //     {
                //         expense: "Dog2",
                //         amount: 124,
                //         category: "entertainment",
                //         date: new Date().toISOString().substring(0, 10),
                //         edit: false
                // } as { expense: string, amount: number, category: string, edit: boolean, date: string }
            ] as Expense[],
            dummy: [

            ] as Expense[],
            filterOptions: {
                category: "all",
                month: "",
                minimumAmount: 0,
                maximumAmount: 0
            } as { category: string, month: string, minimumAmount: number, maximumAmount: number },
            filterSelect: "all" as string,
            selectedMonth: "" as string,
            minimumAmountSelect: 0 as number,
            maximumAmountSelect: 0 as number,
            maxAmountForSliders: 0 as number,
            totalSumPerCategory: {
                'household': 0,
                'travel': 0,
                'food': 0,
                'entertainment': 0,
                'clothing': 0,
                'miscellaneous': 0
            } as SumPerCategory,
        }
    },
    methods: {
        addExpense(): void {
            if (this.expenses.length === 0) {
                this.newItem.id = 1;
            }
            else {
                let lastItemID = this.expenses.at(-1).id;
                this.newItem.id = ++lastItemID;
            }
            this.expenses.push(this.newItem);
            this.setMaxAmount;

            this.resetFilter();
            // Save current expenses to localStorage
            window.localStorage.setItem("expenses", JSON.stringify(this.expenses));
        },
        deleteExpense(index: number): void {
            this.expenses.splice(index, 1);
            this.setMaximumSliderValue();

            // Save current expenses to localStorage
            window.localStorage.setItem("expenses", JSON.stringify(this.expenses));
        },
        editExpense(index: number, id: number): void {

            let expenseToEdit = this.expenses.find((expense: any) => expense.id === id);
            //this.expenses[index].edit = !this.expenses[index].edit;

            expenseToEdit.edit = !expenseToEdit.edit;
            window.localStorage.setItem("expenses", JSON.stringify(this.expenses));
            //nya
            this.setMaximumSliderValue();
            this.setMinimumSliderValue();
            
            if(!expenseToEdit.edit){
                this.resetFilter();
            }
        },
        getExpensesFromStorage(): void {
            // Get expenses from local storage
            if (window.localStorage.getItem('expenses') !== null) {
                this.expenses = window.localStorage.getItem('expenses');
                this.expenses = JSON.parse(this.expenses);
            }
            else {
                window.localStorage.setItem("expenses", JSON.stringify(this.expenses));
                this.expenses = window.localStorage.getItem('expenses');
                this.expenses = JSON.parse(this.expenses);
            }
        },
        // The two methods below keep track of the selected values in the minimum and maximum amount sliders, so that the selected minimum amount cannot exeed selected maximum amount, and vice versa
        setMinimumSliderValue(): void {
            if (parseInt(this.maximumAmountSelect) < parseInt(this.minimumAmountSelect)) {
                this.minimumAmountSelect = this.maximumAmountSelect;
            }
        },
        setMaximumSliderValue(): void {
            this.setMaxAmount;
            // If zero is selected, assume the full range
            if (this.maximumAmountSelect === 0) {
                this.maximumAmountSelect = parseInt(this.maxAmountForSliders);
            }
            // If selected minimum amount is larger than selected maximum amount, set max to min value 
            if (parseInt(this.minimumAmountSelect) > parseInt(this.maximumAmountSelect)) {
                this.maximumAmountSelect = this.minimumAmountSelect;
            }
            // If current maximum expense is less than selected max, set selected max to current maximum expense 
            if (parseInt(this.maxAmountForSliders) < parseInt(this.maximumAmountSelect)) {
                this.maximumAmountSelect = parseInt(this.maxAmountForSliders);
            }
        },
        applyFilter(): void {
            this.filterOptions.category = this.filterSelect;
            this.filterOptions.minimumAmount = this.minimumAmountSelect;
            this.filterOptions.maximumAmount = this.maximumAmountSelect;
            this.filterOptions.month = this.selectedMonth;
        },
        resetFilter(): void {
            this.filterOptions.category = "all";
            this.filterOptions.minimumAmount = 0;
            this.filterOptions.maximumAmount = this.maxAmountForSliders;
            this.filterOptions.month = "";

            this.filterSelect = "all";
            this.minimumAmountSelect = 0;
            this.maximumAmountSelect = this.maxAmountForSliders;
            this.selectedMonth = "";
            this.filterExpenses;
        },
        // Capitalize first letter of a string
        capitalize(string: string): string {
            return string[0].toUpperCase() + string.slice(1);
        },
        drawSVG() {
            let graphBox: HTMLElement | null = this.$refs.graphBox;
            let graphW = 0;
            let graphH = 0;
            if (graphBox !== null) {
                graphW = graphBox.offsetWidth;
                graphH = graphBox.offsetHeight;
            };
            let w = graphW;
            let h = graphH;
            // let w: number = 600;
            // let h: number = 400;
            const svg: HTMLElement = this.createSVG(w, h);
            
            const background: HTMLElement = this.createSvgRect(0, 0, w, h);
            background.style.fill = '#cccccc';
            svg.append(background);
            
            // draw pie chart if all categories selected
            if (this.filterOptions.category === 'all') {
                // Starting parameters for drawing a pie chart. 
                // It's a lot, but I think it all needs to be here, since we use a for-loop to append many svg paths to our svg element..? Or could we create a function that returns a list of svg element an then append them one by one. Fråga Jakob?
                // Skulle vilja knyta en färg till en viss kategori, men det får bli om det finns tid :)
                const colors: string[] = ['tomato', '#FCA753', '#fff567', 'mediumseagreen', 'dodgerblue', 'mediumorchid'];
                const r: number = h / 4;
                const xc: number = w / 2.5;
                const yc: number = h / 2;

                let totalSum: number = 0;
                for (let category in this.totalSumPerCategory) {
                    totalSum += this.totalSumPerCategory[category];
                };
                let nonZeroCategories = Object.keys(this.totalSumPerCategory).filter(key => this.totalSumPerCategory[key] !== 0);
                let x0: number = xc + r;
                let y0: number = yc;
                let amountPercentage: number = 0;
                let angle: number = 0;
                let totalAngle: number = 0;
                let x1: number = 0;
                let y1: number = 0;
                // Arc flag: 0/1 for small/large arc, 0 if angle < pi, otherwise 1. 
                // (will not work with only one category since angle would be 360 = 0, meaning NO path)
                let arcFlag = 0;
                // Starting parameters for drawing a legend.
                let legendXStart: number = w * 0.7;
                let legendYStart: number = h * 0.1;
                let boxSize: number = 10;
                let boxSpace: number = h * 0.045;
                // background is 5px beyond the color boxes:
                let legendBackground: HTMLElement = this.createSvgRect(legendXStart - 5, legendYStart - 5, 150, (boxSpace * (nonZeroCategories.length - 1) + boxSize + 10));
                legendBackground.style.fill = 'white';
                svg.append(legendBackground);
                for (let i = 0; i < nonZeroCategories.length; i++) {
                    amountPercentage = this.totalSumPerCategory[nonZeroCategories[i]] / totalSum;
                    if (amountPercentage > 0) {
                        // pie piece
                        angle = amountPercentage * 360 * (Math.PI / 180);
                        arcFlag = angle > Math.PI ? 1 : 0;
                        totalAngle += angle;
                        x1 = xc + r * Math.cos((totalAngle));
                        y1 = h - (yc + r * Math.sin((totalAngle)));
                        let path: HTMLElement = this.createSvgPath(r, x0, y0, x1, y1, xc, yc, arcFlag, colors[i]);
                        svg.append(path);
                        // update starting position for next pie piece
                        x0 = x1;
                        y0 = y1;

                        // legend color box
                        let legendColorBox: HTMLElement = this.createSvgRect(legendXStart, legendYStart, boxSize, boxSize);
                        legendColorBox.style.fill = colors[i];
                        svg.append(legendColorBox);

                        // legend text
                        let legendEntry: HTMLElement = this.createSvgText(legendXStart + boxSize + 5, legendYStart + boxSize, this.capitalize(nonZeroCategories[i]));
                        svg.append(legendEntry);
                        // update starting position for next legend entry
                        legendYStart += boxSpace;
                    }
                    // if only one category exists in the filter, we have already drawn the legend element, but need to draw a path of a full circle:
                    if (amountPercentage === 1) {
                        // pie piece fo 359 degrees
                        angle = 359 * (Math.PI / 180);
                        arcFlag = angle > Math.PI ? 1 : 0;
                        totalAngle += angle;
                        x1 = xc + r * Math.cos((totalAngle));
                        y1 = h - (yc + r * Math.sin((totalAngle)));
                        let path: HTMLElement = this.createSvgPath(r, x0, y0, x1, y1, xc, yc, arcFlag, colors[i]);
                        svg.append(path);
                        // update starting position for next pie piece, but first back up one degree
                        angle = (-1) * (Math.PI / 180);
                        totalAngle += angle;
                        x1 = xc + r * Math.cos((totalAngle));
                        y1 = h - (yc + r * Math.sin((totalAngle)));
                        x0 = x1;
                        y0 = y1;
                        // Draw a path for 3 degrees to cover the gap
                        angle = 3 * (Math.PI / 180);
                        arcFlag = angle > Math.PI ? 1 : 0;
                        totalAngle += angle;
                        x1 = xc + r * Math.cos((totalAngle));
                        y1 = h - (yc + r * Math.sin((totalAngle)));
                        path = this.createSvgPath(r, x0, y0, x1, y1, xc, yc, arcFlag, colors[i]);
                        svg.append(path);
                    }
                }
            }
            // draw column chart if only one category selected 
            else {
                // if no month selected, draw ALL expenses per month
                if (this.filterOptions.month === '') {
                    
                }
                // if month selected, draw all expenses for selected month, per day
                else {
                    let selectedYearAndMonth: string = this.filterOptions.month;
                    let year: number = parseInt(selectedYearAndMonth.substring(0,4));
                    let allMonthDays: number[] = [31, year % 4 === 0 ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
                    let monthNames: string[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
                    let month: number = parseInt(selectedYearAndMonth.substring(5));
                    let monthName: string = monthNames[month - 1];
                    let monthDays: number = allMonthDays[month - 1];

                    // Anna fortsätt här: skriv ut datum, rita staplar

                }
            }
        },
        createSVG(w: number, h: number) {
            const svg = this.createSvgElement('svg');
            svg.setAttribute('width', w);
            svg.setAttribute('height', h);
            let graphBox: HTMLElement | null = this.$refs.graphBox;

            // WE know that graphBox is not null, but TS doesn't (not the best-looking solution?)..
            if (graphBox !== null) {
                // first clear all the "old" elements..
                while (graphBox.firstElementChild) {
                    graphBox.firstElementChild.remove();
                }
                // .. then append the new one
                graphBox.append(svg);
            }
            return svg;
        },
        createSvgElement(tagType: string) {
            return document.createElementNS('http://www.w3.org/2000/svg', tagType);
        },
        createSvgRect(x: number, y: number, w: number, h: number) {
            const rectangle = this.createSvgElement('rect');
            rectangle.setAttribute('width', w);
            rectangle.setAttribute('height', h);
            rectangle.setAttribute('x', x);
            rectangle.setAttribute('y', y);
            return rectangle;
        },
        createSvgPath(r: number, x0: number, y0: number, x1: number, y1: number, cx: number, yc: number, arcFlag: number, color: string) {
            const path = this.createSvgElement('path');
            path.setAttribute('fill', 'none');
            path.setAttribute('stroke', color);
            // kanske ha variabel stroke-width beroende på w eller h?
            path.setAttribute('stroke-width', '15%');
            let buildPath = 'M ' + x0 + ',' + y0 +
                ' A ' + r + ' ' + r + ' 0 ' + arcFlag + ' 0 ' + x1 + ',' + y1;
            path.setAttribute('d', buildPath);
            path.setAttribute('transform', 'rotate(-90, ' + cx + ',' + yc + ')');
            return path;
        },
        // createSvgCircle(cx: number, cy: number, r: number) {
        //     const circle = this.cleareSvgElement('circle');
        //     circle.setAttribute('cx', cx);
        //     circle.setAttribute('cy', cy);

        // },
        createSvgText(x: number, y: number, text: string) {
            const entry = this.createSvgElement('text');
            entry.setAttribute('x', x);
            entry.setAttribute('y', y);
            entry.textContent = text;
            return entry;
        },
        // // om nedan funktion INTE är bortkommenterad så hamnar vi i filterExpenses när vi ändrar en siffra i edit. Det går inte att edita amount och category när den är kvar. 
        // // Om den ÄR bortkommenterad hamnar den inte i filterExpenses, men då funkar inte cirkeldiagrammet.... VARFÖR????? 
        // JAKOB HJÄLP
        calcTotalSumPerCategory() {
            for (let d of this.filterExpenses) {
                this.totalSumPerCategory[d.category] += d.amount;
                console.log(this.totalSumPerCategory[d.category]);
            };
        },
        clearTotalSumPerCategory() {
            this.totalSumPerCategory.household = 0;
            this.totalSumPerCategory.travel = 0;
            this.totalSumPerCategory.food = 0;
            this.totalSumPerCategory.entertainment = 0;
            this.totalSumPerCategory.clothing = 0;
            this.totalSumPerCategory.miscellaneous = 0;
        }
    },
    watch: {
        expenses: {
            handler() {
                console.log("hello");
            },
            //this.filterExpenses;
        },
        dummy: {
            handler() {
                console.log("hello from dummy");
            },
        },
        maxAmountForSliders() {

        }
    },
    // kör en gång när programmet startas:
    mounted() {

        if (window.localStorage.getItem('expenses') !== null) {
            this.expenses = window.localStorage.getItem('expenses');
            this.expenses = JSON.parse(this.expenses);
        }
        else {
            window.localStorage.setItem("expenses", JSON.stringify(this.expenses));
            this.expenses = window.localStorage.getItem('expenses');
            this.expenses = JSON.parse(this.expenses);
        }

        this.applyFilter();
        this.calcTotalSumPerCategory();
        this.drawSVG();
    },
    // TESTA WATCH??!! ?? !! :) :) ??
    computed: {
        // Lade till brackets i returtypen. För visst är det en lista av expenses vi skickar tillbaka?
        filterExpenses(): Expense[] {
            // this.setMaximumSliderValue();

            let dummy;
            if (this.filterOptions.category === "all") {
                dummy = this.expenses.slice();
            }
            else {
                dummy = this.expenses.filter((ex: { category: string; }) => ex.category === this.filterOptions.category);
            }

            //Only apply cost filter if a maximum cost is selected (i.e it is not at 0)
            if (this.filterOptions.maximumAmount !== 0) {
                dummy = dummy.filter((ex: {edit: boolean, amount: number }) => ex.amount >= this.filterOptions.minimumAmount && ex.amount <= this.filterOptions.maximumAmount || ex.edit === true);
            }

            //If month is not an empty string. Apply month filter.
            if (this.filterOptions.month !== "") {
                dummy = dummy.filter((ex: { date: string }) => ex.date.includes(this.filterOptions.month));
            }

            return dummy;
        },
        // Sets the highest entered amount for an expense (used for cost filter sliders)
        setMaxAmount(): void {
            // ChatGPT helped with this one:
            this.maxAmountForSliders = this.expenses.reduce((max: number, currentExpense: any) => {
                return currentExpense.amount > max ? currentExpense.amount : max;
            }, 0);
        },
    }
}).mount('#app')
