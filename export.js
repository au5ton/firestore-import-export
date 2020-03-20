
const admin = require("firebase-admin");
const fs = require('fs');
const serviceAccount = require("/home/austin/.config/me/cougargrades-aefb6.firebaseadminsdk.json");

let i = 0;
let j = 0;

let collectionName = process.argv[2];
let subCollection = process.argv[3];
console.log(`collectionName: ${collectionName}`)
console.log(`subCollection:  ${subCollection}`)

// You should replace databaseURL with your own
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://cougargrades-aefb6.firebaseio.com"
});

let db = admin.firestore();
db.settings({ timestampsInSnapshots: true });

let data = {};
data[collectionName] = {};

let results = db.collection(collectionName)
.get()
.then(async snapshot => {
  console.log(`Query size: ${snapshot.size}`)
  for(let doc of snapshot.docs) {
    fs.mkdirSync(`export/${collectionName}`, { recursive: true })
    fs.writeFileSync(`export/${collectionName}/${doc.id}.json`, JSON.stringify(doc.data()))
    console.log(`${++i} : \t ${collectionName} \t ${doc.id}`)
    if(subCollection) {
        await addSubCollection(doc.id, {})
    }
    //data[collectionName][doc.id] = doc.data();
  }
  //return data;
})
.catch(error => {
  console.log(error);
})

/*results.then(dt => {  
  getSubCollection(dt).then(() => {    
    // Write collection to JSON file
    fs.writeFile("firestore-export.json", JSON.stringify(data), function(err) {
        if(err) {
            return console.log(err);
        }
        console.log("The file was saved!");
    });
  })  
})*/

async function getSubCollection(dt){
  for (let [key, value] of Object.entries([dt[collectionName]][0])){
    if(subCollection !== undefined){
      data[collectionName][key]['subCollection'] = {};
      await addSubCollection(key, data[collectionName][key]['subCollection']);            
    }          
  }  
}

function addSubCollection(key, subData){
  return new Promise(resolve => {
    db.collection(collectionName).doc(key).collection(subCollection).get()
    .then(snapshot => {      
      snapshot.forEach(subDoc => {
        fs.mkdirSync(`export/${collectionName}/${key}/${subCollection}`, { recursive: true })
        fs.writeFileSync(`export/${collectionName}/${key}/${subCollection}/${subDoc.id}.json`, JSON.stringify(subDoc.data()))
        console.log(`\t${++j} : \t ${subCollection} \t ${subDoc.id}`)
        //subData[subDoc.id] =  subDoc.data();
        resolve('Added data');                                                                 
      })
    })
  })
}
