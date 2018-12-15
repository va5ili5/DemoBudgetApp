//module that handles budget (closure + IIFE). IFFE that returns an object
//modules are function expressions
//independent modules (separation of concerns)
//Budget Controller (handles budget calculations)
var budgetController = (function(){
    /* 
    The "new" keyword creates an empty object and then calls the Expense function 
    and points to this keyword of that function to the new object that was created.
    So when we're done set properties on the this keyword
    we automatically set them on the new object that was created here.
    var exp = new Expense
    
    */

   'use strict';

    //function constructor to intatiate many objects
    var Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    }

    var Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    }

    var calculateTotals = function(type){
        var sum = 0;

        data.allItems[type].forEach(function(current){
            sum += current.value;
        })

        data.totals[type] = sum;
    }

    var data = {
        allItems:{
            exp:[],
            inc:[]
        },
        totals:{
            exp:0,
            inc:0
        },
        budget : 0,
        percentage : -1
    }

    return{
        addItem: function(type, des, val){
            var newItem, ID;

            if(data.allItems[type].length >0 ){
                ID = data.allItems[type][data.allItems[type].length-1].id + 1;
            }else{
                ID=0;
            }


            if(type === 'exp'){
                newItem = new Expense(ID, des, val);
            }else if(type === 'inc'){
                newItem = new Income(ID, des, val);
            }

            data.allItems[type].push(newItem);

            return newItem;
        },

        deleteItem:function(type, id){
            var idsArray, index;

            //data.allItems[type] = data.allItems[type].filter(x => x.id !== id)

            idsArray = data.allItems[type].map(function(current){
                return current.id
            });

            index = idsArray.indexOf(id);

            if(index !== -1){
                data.allItems[type].splice(index, 1);
            }
        },

        calculateBudget:function(){
            calculateTotals('exp');
            calculateTotals('inc');

            data.budget = data.totals.inc - data.totals.exp;

            if(data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            }
        },

        getBudget: function(){
            return{
                budget : data.budget,
                percentage : data.percentage,
                income : data.totals.inc,
                expences : data.totals.exp
            }
        },

        testShow: function(type){
            console.log(data.allItems[type]);
        }
    }
})();


//UI Controller (handles UI staff)
var UIController = (function(){

    'use strict';

    var DOMStrings = {
        inputType: '#type',
        inputDescription: '#description',
        inputAmount: '#amount',
        inputBtn: '#addBtn',
        expencesContainer: '.expensesList',
        incomeContainer: '.incomeList',
        totalBudget: '.totalBudget',
        incomeAmount: '.incomeAmount',
        expenceAmount: '.expenceAmount',
        expencePercentage: '.expencePercentage',
        container: '.list-container'
    }

    function getItems(){
        return{
            type: document.querySelector(DOMStrings.inputType).value,
            description: document.querySelector(DOMStrings.inputDescription).value,
            amount: parseFloat(document.querySelector(DOMStrings.inputAmount).value)
        }
    }
    
    return{
        getItems: getItems,

        addItem: function(obj, type){
            var html, element;

            if(type === 'exp'){
                element = document.querySelector(DOMStrings.expencesContainer);
                html = '<div class="grid-row" id="exp-'+ obj.id +'"><div class="desc">' + obj.description + '</div><div class="amount">' +obj.value + '</div><div class="delete"></div></div></div>'
            }else if(type === 'inc'){
                element = document.querySelector(DOMStrings.incomeContainer);
                html = '<div class="grid-row" id="inc-'+ obj.id +'"><div class="desc">' + obj.description + '</div><div class="amount">' +obj.value + '</div><div class="delete"></div></div></div>'
            }

            element.insertAdjacentHTML('beforeend', html);


        },

        deleteItem:function(id){
            var el;

            el = document.getElementById(id);

            el.parentNode.removeChild(el);
        },

        updateBudget:function(budgetObj){
            document.querySelector(DOMStrings.totalBudget).textContent = budgetObj.budget;
            document.querySelector(DOMStrings.expenceAmount).textContent = budgetObj.expences;
            document.querySelector(DOMStrings.incomeAmount).textContent = budgetObj.income;
            document.querySelector(DOMStrings.expencePercentage).textContent = budgetObj.percentage;

            if(budgetObj.percentage > 0){
                document.querySelector(DOMStrings.expencePercentage).textContent = budgetObj.percentage + ' %';
            }else{
                document.querySelector(DOMStrings.expencePercentage).textContent = '---';
            }

        },

        clearfields: function(){
            var fields, fieldsArray;

            fields = document.querySelectorAll(DOMStrings.inputDescription + ', ' + DOMStrings.inputAmount);

            //NodeList supports forEach in modern browsers. Only IE doesn't support
            if(typeof fields.forEach === "function"){
                fields.forEach(function(current){
                    current.value = "";
                });
            }
            else{
                fieldsArray = Array.prototype.slice.call(fields);

                fieldsArray.forEach(function(current, index, fieldsArray){
                    current.value = "";
                })
            }
            

            document.querySelector(DOMStrings.inputDescription).focus();
        },

        getDOMStrings: function(){
            return DOMStrings;
        }
    }

})();


//App Controller (main app controller. connect the rest modules)
var appController = (function(budgetCtrl, UICtrtl){
    
    'use strict';
    var input, newItem;

    var setEventListeners = function(){
        var DOM = UICtrtl.getDOMStrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', appCtrlAddItem);

        document.addEventListener('keypress', function(event){
            if(event.keyCode === 13){
                appCtrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', appCtrlDeleteItem)
    }

    var updateBudget = function(){
        budgetCtrl.calculateBudget();
        var budget = budgetCtrl.getBudget();
        UICtrtl.updateBudget(budget);
    }

    var appCtrlAddItem = function(){
        input = UICtrtl.getItems();

        if(input.description != "" && !isNaN(input.amount) && input.amount > 0){
            newItem = budgetCtrl.addItem(input.type, input.description, input.amount);

            UICtrtl.addItem(newItem, input.type);
    
            UICtrtl.clearfields();
            
            updateBudget();
        }
    }

    var appCtrlDeleteItem = function(event){
        var itemID, splitID, type, id;

        itemID = event.target.parentNode.id;

        if(itemID){
            splitID = itemID.split('-');
            type = splitID[0];
            id = parseInt(splitID[1]);
            budgetCtrl.deleteItem(type, id);
            UICtrtl.deleteItem(itemID);
            updateBudget();
        }
    }

    return{
        init: function(){
            console.log('App Started');
            setEventListeners();
        }
    };
    

})(budgetController, UIController);

appController.init();