function getAllIndexes(arr) {
    var arr1=arr;
   var arrsort=arr.sort().reverse();
    var MaxIndexes = [];

    for (i=0; i<3; i++){
        MaxIndexes.push(arr1.indexOf(arrsort[i]))
    }
    return MaxIndexes

}
console.log(getAllIndexes([1,2,3,2,5])); // outputs [2,4]
