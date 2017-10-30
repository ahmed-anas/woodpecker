let ites = 10;
var prospects = new Array(ites);
for(let index=0;index<ites ;index++){
    let prospect = {
    	"email":"add"+index+"@email.co", 
    	"first_name":"John", 
        "last_name":"Doe",
        "status":"ACTIVE",
        "tags":"#tags",
        "company":"company",
        "industry":"industry",
        "title":"title",
        "phone":"+123 456 789",
        "address":"address",
        "city":"city",
        "state":"state",
        "country":"country",
        "website":"website",
        "snipet1":"snipet1",
        "snipet2":"snipet2",
        "snipet3":"snipet3",
        "snip":"snipet4"
    	}
        prospects[index]=prospect;
}
module.exports = prospects;