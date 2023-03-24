import { createApp } from 'vue';
;
;
var app = createApp({
    data: function () {
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
            },
            expenses: [],
            filterOptions: {
                category: "all",
                month: "",
                minimumAmount: 0,
                maximumAmount: 0
            },
            filterSelect: "all",
            selectedMonth: "",
            minimumAmountSelect: 0,
            maximumAmountSelect: 0,
            maxAmountForSliders: 0,
            totalSumPerCategory: {
                'household': 0,
                'travel': 0,
                'food': 0,
                'entertainment': 0,
                'clothing': 0,
                'miscellaneous': 0
            },
            height: 0,
            width: 0
        };
    },
    methods: {
        addExpense: function () {
            if (this.expenses.length === 0) {
                this.newItem.id = 1;
            }
            else {
                var lastItemID = this.expenses.at(-1).id;
                this.newItem.id = ++lastItemID;
            }
            // make deep copy of newItem, push to expenses
            this.expenses.push(JSON.parse(JSON.stringify(this.newItem)));
            this.setMaxAmount;
            this.resetFilter();
            // Save current expenses to localStorage
            window.localStorage.setItem("expenses", JSON.stringify(this.expenses));
            // Reset input fields
            this.newItem.expense = '';
            this.newItem.amount = 0;
            this.newItem.category = "";
            this.newItem.date = new Date().toISOString().substring(0, 10);
            this.drawSVG();
        },
        deleteExpense: function (index) {
            this.expenses.splice(index, 1);
            this.minimumSliderControl();
            // Save current expenses to localStorage
            window.localStorage.setItem("expenses", JSON.stringify(this.expenses));
            this.drawSVG();
        },
        editExpense: function (index, id) {
            var expenseToEdit = this.expenses.find(function (expense) { return expense.id === id; });
            expenseToEdit.edit = !expenseToEdit.edit;
            window.localStorage.setItem("expenses", JSON.stringify(this.expenses));
            //nya
            this.minimumSliderControl();
            this.maximumSliderControl();
            if (!expenseToEdit.edit) {
                this.resetFilter();
            }
            this.drawSVG();
        },
        getExpensesFromStorage: function () {
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
        maximumSliderControl: function () {
            // Get max amount from expense list
            this.setMaxAmount;
            // If selected maximum amount is less than selected minimum amount, set min to max
            if (parseInt(this.maximumAmountSelect) < parseInt(this.minimumAmountSelect)) {
                this.minimumAmountSelect = this.maximumAmountSelect;
            }
            // If max was set to 0, set it to max amount from expense list
            if (parseInt(this.maximumAmountSelect) === 0) {
                this.maximumAmountSelect = parseInt(this.maxAmountForSliders);
            }
        },
        minimumSliderControl: function () {
            // Get max amount from expense list
            this.setMaxAmount;
            // If selected minimum amount is larger than selected maximum amount, set max to min
            if (parseInt(this.minimumAmountSelect) > parseInt(this.maximumAmountSelect)) {
                this.maximumAmountSelect = this.minimumAmountSelect;
            }
            // If min was set to max amount from expense list, set it to 0
            if (parseInt(this.minimumAmountSelect) === this.maxAmountForSliders) {
                this.minimumAmountSelect = 0;
            }
        },
        applyFilter: function () {
            this.filterOptions.category = this.filterSelect;
            this.filterOptions.minimumAmount = this.minimumAmountSelect;
            this.filterOptions.maximumAmount = this.maximumAmountSelect;
            this.filterOptions.month = this.selectedMonth;
        },
        resetFilter: function () {
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
        capitalize: function (string) {
            if (string !== '') {
                return string[0].toUpperCase() + string.slice(1);
            }
            else {
                return '';
            }
        },
        drawSVG: function () {
            var _this = this;
            this.clearTotalSumPerCategory();
            this.calcTotalSumPerCategory();
            var graphBox = this.$refs.graphBox;
            var w = graphBox.offsetWidth;
            var h = w * (2 / 3);
            var svg = this.createSVG(w, h);
            var background = this.createSvgRect(0, 0, w, h);
            background.style.fill = '#cccccc';
            svg.append(background);
            // Starting parameters for drawing a pie chart. 
            var colors = ['tomato', '#FCA753', '#fff567', 'mediumseagreen', 'dodgerblue', 'mediumorchid'];
            // radius and center coordinates for path
            var r = h / 4;
            var xc = w * (1 / 3);
            var yc = h * (4 / 7);
            var totalSum = 0;
            for (var category in this.totalSumPerCategory) {
                totalSum += this.totalSumPerCategory[category];
            }
            ;
            var nonZeroCategories = Object.keys(this.totalSumPerCategory).filter(function (key) { return _this.totalSumPerCategory[key] !== 0; });
            var x0 = xc + r;
            var y0 = yc;
            var percentageOfFullPath = 0;
            // angle is used to calculate the percentage of full path for each path element
            var angle = 0;
            // totalAngle is used to calculate the end point for each path
            var totalAngle = 0;
            var x1 = 0;
            var y1 = 0;
            // Arc flag: 0/1 for small/large arc, 0 if angle < pi, otherwise 1. 
            var arcFlag = 0;
            // Don't draw anything if there are no filtered categories
            if (nonZeroCategories.length !== 0) {
                // Starting parameters for drawing a legend.
                var legendXStart = w * 0.65;
                var legendYStart = yc - r - h * 0.065;
                var boxSize = h / 50;
                var boxSpace = h / 20;
                // Legend background starts 5px before the color boxes (in x- & y-direction) and ends 5px after color boxes (in y-direction):
                var legendBackground = this.createSvgRect(legendXStart - 5, legendYStart - 5, w / 3, (boxSpace * (nonZeroCategories.length - 1) + boxSize + 10));
                legendBackground.style.fill = 'white';
                svg.append(legendBackground);
                // Draw paths (or circle if only one category):
                for (var i = 0; i < nonZeroCategories.length; i++) {
                    percentageOfFullPath = this.totalSumPerCategory[nonZeroCategories[i]] / totalSum;
                    if (percentageOfFullPath > 0) {
                        // pie piece
                        angle = percentageOfFullPath * 360 * (Math.PI / 180);
                        arcFlag = angle > Math.PI ? 1 : 0;
                        totalAngle += angle;
                        x1 = xc + r * Math.cos((totalAngle));
                        y1 = yc - r * Math.sin((totalAngle));
                        var path = this.createSvgPath(r, x0, y0, x1, y1, xc, yc, arcFlag, colors[i]);
                        svg.append(path);
                        // update starting position for next pie piece
                        x0 = x1;
                        y0 = y1;
                        // legend color box
                        var legendColorBox = this.createSvgRect(legendXStart, legendYStart, boxSize, boxSize);
                        legendColorBox.style.fill = colors[i];
                        svg.append(legendColorBox);
                        // legend text
                        var legendEntry = this.createSvgText(legendXStart + boxSize + 5, legendYStart + boxSize, this.capitalize(nonZeroCategories[i]));
                        legendEntry.setAttribute('font-size', h / 34 + 'px');
                        svg.append(legendEntry);
                        // update starting position for next legend entry
                        legendYStart += boxSpace;
                    }
                    // draw a circle if only one category exists in the filter:
                    // (path will not work with only one category since angle would be 360 = 0, meaning NO path)
                    // (we have already drawn the legend element)
                    if (percentageOfFullPath === 1) {
                        var circle = this.createSvgCircle(xc, yc, r);
                        svg.append(circle);
                    }
                }
                // Build a title string and append to svg graph
                var titleText = "Expenses ";
                var selectedMonth = this.filterOptions.month;
                if (selectedMonth !== '') {
                    var month = parseInt(selectedMonth.substring(5));
                    var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
                    titleText += ' for ' + monthNames[month - 1];
                }
                ;
                if (this.filterOptions.minimumAmount == 0 &&
                    this.filterOptions.maximumAmount != this.maxAmountForSliders &&
                    this.filterOptions.maximumAmount != 0) {
                    titleText += ' up to ' + this.filterOptions.maximumAmount + ' kr';
                }
                else if (this.filterOptions.maximumAmount == this.maxAmountForSliders &&
                    this.filterOptions.minimumAmount != 0) {
                    titleText += ' above ' + this.filterOptions.minimumAmount + ' kr';
                }
                else if (this.filterOptions.minimumAmount != 0 &&
                    this.filterOptions.minimumAmount != this.maxAmountForSliders &&
                    this.filterOptions.maximumAmount != 0 &&
                    this.filterOptions.maximumAmount != this.maxAmountForSliders) {
                    titleText += ' between ' + this.filterOptions.minimumAmount + ' and ' +
                        this.filterOptions.maximumAmount + ' kr';
                }
                ;
                var graphTitle = this.createSvgText(w / 2, h * 0.1, titleText);
                graphTitle.setAttribute('dominant-baseline', 'middle');
                graphTitle.setAttribute('text-anchor', 'middle');
                graphTitle.setAttribute('font-size', h / 20 + 'px');
                svg.append(graphTitle);
                var sumText = this.createSvgText(legendXStart - 5, h * 0.95, "Sum of illustrated expenses: " + totalSum.toLocaleString('sv-SE') + ' kr');
                sumText.setAttribute('class', 'small');
                sumText.setAttribute('font-size', h / 35 + 'px');
                svg.append(sumText);
            }
        },
        createSVG: function (w, h) {
            var svg = this.createSvgElement('svg');
            svg.setAttribute('width', w);
            svg.setAttribute('height', h);
            // ny
            var viewboxString = '0 0 ' + w + ' ' + h;
            svg.setAttribute('viewbox', viewboxString);
            svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
            // hit
            var graphBox = this.$refs.graphBox;
            // first clear all the "old" elements..
            while (graphBox.firstElementChild) {
                graphBox.firstElementChild.remove();
            }
            // .. then append the new one
            graphBox.append(svg);
            return svg;
        },
        createSvgElement: function (tagType) {
            return document.createElementNS('http://www.w3.org/2000/svg', tagType);
        },
        createSvgRect: function (x, y, w, h) {
            var rectangle = this.createSvgElement('rect');
            rectangle.setAttribute('width', w);
            rectangle.setAttribute('height', h);
            rectangle.setAttribute('x', x);
            rectangle.setAttribute('y', y);
            return rectangle;
        },
        createSvgPath: function (r, x0, y0, x1, y1, xc, yc, arcFlag, color) {
            var path = this.createSvgElement('path');
            path.setAttribute('fill', 'none');
            path.setAttribute('stroke', color);
            path.setAttribute('stroke-width', '15%');
            var buildPath = 'M ' + x0 + ',' + y0 +
                ' A ' + r + ' ' + r + ' 0 ' + arcFlag + ' 0 ' + x1 + ',' + y1;
            path.setAttribute('d', buildPath);
            path.setAttribute('transform', 'rotate(-90, ' + xc + ',' + yc + ')');
            var animation = this.createSvgElement('animate');
            // Arc = v * r where v is in radians
            // animation.setAttribute('attributeName', 'd');
            // animation.setAttribute('dur', '1s');
            // path.append(animation);
            return path;
        },
        createSvgCircle: function (xc, yc, r) {
            var circle = this.createSvgElement('circle');
            circle.setAttribute('cx', xc);
            circle.setAttribute('cy', yc);
            circle.setAttribute('r', r);
            circle.setAttribute('stroke', 'tomato');
            circle.setAttribute('stroke-width', '15%');
            circle.setAttribute('fill', 'transparent');
            return circle;
        },
        createSvgText: function (x, y, text) {
            var entry = this.createSvgElement('text');
            entry.setAttribute('x', x);
            entry.setAttribute('y', y);
            entry.textContent = text;
            return entry;
        },
        calcTotalSumPerCategory: function () {
            for (var _i = 0, _a = this.filterExpenses; _i < _a.length; _i++) {
                var d = _a[_i];
                this.totalSumPerCategory[d.category] += d.amount;
            }
            ;
        },
        clearTotalSumPerCategory: function () {
            this.totalSumPerCategory.household = 0;
            this.totalSumPerCategory.travel = 0;
            this.totalSumPerCategory.food = 0;
            this.totalSumPerCategory.entertainment = 0;
            this.totalSumPerCategory.clothing = 0;
            this.totalSumPerCategory.miscellaneous = 0;
        },
        resizeHandler: function (e) {
            this.height = window.innerHeight;
            this.width = window.innerWidth;
            this.drawSVG();
        }
    },
    // Run once when program starts
    mounted: function () {
        window.addEventListener("resize", this.resizeHandler);
        if (window.localStorage.getItem('expenses') !== null) {
            this.expenses = window.localStorage.getItem('expenses');
            this.expenses = JSON.parse(this.expenses);
        }
        else {
            window.localStorage.setItem("expenses", JSON.stringify(this.expenses));
            this.expenses = window.localStorage.getItem('expenses');
            this.expenses = JSON.parse(this.expenses);
        }
        this.setMaxAmount;
        this.applyFilter();
        this.calcTotalSumPerCategory();
        this.drawSVG();
        this.height = window.innerHeight;
        this.width = window.innerWidth;
    },
    computed: {
        filterExpenses: function () {
            var _this = this;
            var dummy;
            if (this.filterOptions.category === "all") {
                dummy = this.expenses.slice();
            }
            else {
                dummy = this.expenses.filter(function (ex) { return ex.category === _this.filterOptions.category; });
            }
            // Only apply cost filter if a maximum cost is selected (i.e it is not at 0)
            if (parseInt(this.filterOptions.maximumAmount) !== 0) {
                dummy = dummy.filter(function (ex) { return ex.amount >= _this.filterOptions.minimumAmount && ex.amount <= _this.filterOptions.maximumAmount || ex.edit === true; });
            }
            //If month is not an empty string. Apply month filter.
            if (this.filterOptions.month !== "") {
                dummy = dummy.filter(function (ex) { return ex.date.includes(_this.filterOptions.month); });
            }
            return dummy;
        },
        // Sets the highest entered amount for an expense (used for cost filter sliders)
        setMaxAmount: function () {
            // ChatGPT helped with this one:
            this.maxAmountForSliders = this.expenses.reduce(function (max, currentExpense) {
                return currentExpense.amount > max ? currentExpense.amount : max;
            }, 0);
        },
        destroyed: function () {
            window.removeEventListener("resize", this.resizeHandler);
        }
    }
}).mount('#app');
//# sourceMappingURL=main.js.map