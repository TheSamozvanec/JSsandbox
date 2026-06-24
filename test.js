let base='https://poligon.semov777.com/api'
async function test(){
  let obj={
   login:'',
   password:''
  }
   let body=JSON.stringify(obj)
  try{
   let res1 = await fetch(
   base+'/auth/sign-in', {
   method:'POST',
   headers:{'Content-Type':'application/json'},
   credentials: 'include',
   body
   })
   if (res1.status>=400) throw new Error ('fuck! ' + res1.status)
   let json1= await res1.json()
   printR (json1)
   let res2 = await fetch(
   base+'/user/with-things/1',{
     credentials: 'include'
   })
   if (res2.status>=400) throw new Error ('fuck! '+res2.status)
   let json2=await res2.json()
   printR (json2)
  } catch(err) {
    print(err)
  } finally{
    return
  }
}

