# Binder
javascript 属性绑定

>install
npm install binder-core

#bindProperty

    var test = {a:1};
    var output = {b:1};
    var binder = new Binder();
    binder.bindProperty(test, "a", output, "b");
    test.a +=5;
    expect(output.b).toBe(6);
    binder.unBinding();
    test.a +=5;
    expect(output.b).toBe(6);

#bindSetter

    var test = {a:1};
    var output = 1;
    var binder = new Binder();
    binder.bindSetter(test, "a", (v)=>{
        output = v;
    });
    test.a +=5;
    var result = output;
    expect(result).toBe(6);
    binder.unBinding();
    var result = output;
    expect(result).toBe(6);
