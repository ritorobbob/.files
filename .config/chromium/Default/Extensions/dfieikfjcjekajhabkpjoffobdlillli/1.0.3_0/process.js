"use strict";
/**
 * Regular expression to replace all html tags in text (not 100% effective, should be fine for this purpose)
 */
const TAG_REGEX = /(<([^>]+)>)/ig;
const NEWLINE_REGEX = /\n[\s\S]*/ig;
let SORT_BOUND = false;

/**
 * Function to create the text for Path of Building
 * @param {*Element} e element to get mods for
 * @returns {string} string of mods and name
 */
function getPOBText(e){
    //get name of item
    let name = getNameOfItem(e);
    
    let output=`${name.flavour}\n${name.base}\n=======================\n`;
    //get all mods
    let lists = e.getElementsByClassName('mods');
    //loop through all mods and add them to the output text making sure to append a line break after each
    for(let i=0;i<lists.length;i++){
        let mods = lists[i].getElementsByTagName('li');
        for(let j=0;j<mods.length;j++){
            //clone node
            let node = getSpanlessCopyOfNode(mods[j]);
            let t = node.innerHTML.replace(NEWLINE_REGEX,'').replace(TAG_REGEX,'');
            let isCrafted = 0<mods[j].getElementsByClassName('label-crafted').length;
            output += isCrafted ? '{crafted}':'';
            output += t + (j!==(mods.length-1) || i!==(lists.length-1) ? "\n" : '');
        }
    }
    //if corrupted add flag for corruption
    if(name.corrupted)
        output += "\nCorrupted";
    return output;
};

/**
 * Retrieves an array of base item types grouped by type.
 * Will be used to split item names for entry into Path of Building
 */
function getBaseItemLists(){
    //get base options
    let opts = document.getElementById('base');
    
    //.getElementsByTagName('option');
    let arr = [];
    //create array of text versions
    Array.from(opts).forEach((o)=>arr.push(o.innerHTML));
    
    return arr;
};

/**
 * Makes a copy of an Element and removes all spans from it's tree
 * @param {*Element} toCopy The element which should be copied and cleaned
 */
function getSpanlessCopyOfNode(toCopy){
    let node = toCopy.cloneNode(true);
    let children = node.getElementsByTagName('span');
    for(let k=0;k<children.length;k++){
        node.removeChild(children[k]);
    }
    return node;
}

/**
 * Gets the Flavour Name of the Item, the Base and whether the item is corrupted or not
 * @param {*Element} e the item container element 
 */
function getNameOfItem(e){
    const bases = getBaseItemLists();
    let title = e.getElementsByClassName('title')[0];
    let node = getSpanlessCopyOfNode(title);
    
    let fullName = node.innerHTML.trim();

    let matches = [];
    for(let i=0;i<bases.length;i++){
        if(-1 !== fullName.indexOf(bases[i])){
            matches.push(bases[i].trim());
            //break;
        }
    }
    let matchIdx=0;
     if(1<matches.length){
         for(let i=0;i<matches.length;i++)
             if(fullName.length === fullName.indexOf(matches[i]) + matches[i].length)
                matchIdx = i;
     }
    let base=matches[matchIdx].trim();
        
    let flavour = fullName.substr(0,fullName.indexOf(base)).trim();
    return {
        base:base,
        flavour: flavour,
        corrupted: 0!==title.getElementsByClassName('corrupted').length
    }
}


/**
 * creates the links to click on the poe.trade page
 */
function createLinks(){
    //Can have multiple search result boxes
    let results = document.getElementsByClassName('item');
    const range = document.createRange();
    for(let i=0;i<results.length;i++){
        let e = results[i];
        let ul = e.getElementsByClassName('bottom-row')[0].getElementsByClassName('proplist')[0];
        let li = document.createElement('li');
        li.className = 'pob-copy';
        li.innerHTML = 'POB';
        li.style.fontWeight = 'bold';
        li.style.cursor= 'pointer';
        li.addEventListener('click', (ev)=>{
            copyItemToClipboard(e.id);
        });
        ul.appendChild(li);
    }

    //do not bind multiple times to the event
    if(!SORT_BOUND){
        document.getElementsByClassName('loader')[0].addEventListener('DOMSubtreeModified',()=>{
            if(""==document.getElementsByClassName('loader')[0].innerText) //only create links after the loading is complete after sorting
                setTimeout(createLinks,500); //gangster wait for the whisper bar to be rewritten.
        });
        SORT_BOUND = true;
    }
}

/**
 * Main entry of the click from the UI
 * @param {*String} id ID Of the element to create the paste for 
 */
function copyItemToClipboard(id){
    //get element
    let pobEle = document.getElementById(id);
    
    //get the text
    let textToCopy = getPOBText(pobEle);
    
    //perform actual clipboard copy
    let copyDiv = document.createElement('textarea');
    copyDiv.textContent = textToCopy;
    let body = document.getElementsByTagName('body')[0];
    body.appendChild(copyDiv);
    copyDiv.select();
    document.execCommand('copy');
    body.removeChild(copyDiv);
    pobEle.getElementsByClassName('pob-copy')[0].innerText = 'cp\'d';
}

createLinks();
