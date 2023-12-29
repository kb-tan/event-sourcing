import { IConnector, IEventBus, IReplay, ITopic, parseConfig } from './config';
import * as fs from 'fs';
const config = parseConfig('../config/config.yaml');

class WritableStreamSet {

    private set = new Set();
    private stream:fs.WriteStream;

    constructor(stream:fs.WriteStream ) {
        this.stream = stream;
    }

    write(msg: string|Buffer) {
        this.set.add(msg);
    }

    flush() {
        this.set.forEach((msg) => {
            this.stream.write(msg);
            this.stream.write('\n');
        })
        this.set = new Set();
        this.stream.end();
    }

    print() {
        this.set.forEach((msg) => {
            console.log(msg);
        })
    }
}

interface Node {
    name: string
    printNode: (output: WritableStreamSet) => void;
}

enum Relationship {
    "HAS-A" = "has-a",
    "IS-A" = "is-a",
    "SUBSCRIBE" = "subscribe"
}

interface Remark {
   relationship: Relationship; 
   subject: string;
}


class Connection {
    public readonly source:Node;
    public readonly target:Node;
    public readonly remark:Remark;

    constructor(source: Node, target: Node, remark: Remark) {
        this.source = source;
        this.target = target;
        this.remark = remark;
    }

    getConnection(relationship: Relationship) {
        let connection = "--";
        if(Relationship.SUBSCRIBE === relationship) {
            connection = "->"
        }
        return connection;
    }

    getStyle(remark: Remark) {

        let relation = 'has';
        let dashDense = 0;

        if(Relationship.SUBSCRIBE === remark.relationship) {
            relation = 'subscribe-to';
            dashDense = 4
        }
        return `${relation} ${remark.subject} {
            style: {
                stroke-dash: ${dashDense}
            }
        }`
    }
 
    print(stream: WritableStreamSet) {
        const conn = this.getConnection(this.remark.relationship); 
        const style = this.getStyle(this.remark);
        const output = `${this.source.name} ${conn} ${this.target.name}: ${style}`
        stream.write(output);
        if(! (this.source instanceof Bus)) {
            this.source.printNode(stream);
        }
        if(! (this.target instanceof Bus)) {
            this.target.printNode(stream);
        }
    }
}

class Connector implements Node {
    public readonly name;
    public readonly type;
    public readonly namespace = "Connector";
    public readonly sharp = `${this.namespace}.*.shape: square`
    public readonly style = `${this.namespace}.style.border-radius : 8`


    public readonly icon  = {
        "sns": `${this.namespace}.sns.*.icon: https://icons.terrastruct.com/aws%2FCompute%2FAWS-Lambda.svg`,
        "lambda": `${this.namespace}.lambda.*.icon: https://icons.terrastruct.com/aws%2FApplication%20Integration%2FAmazon-Simple-Notification-Service-SNS.svg`
    }

    constructor(name: string, type: string) {
        // console.log(`** ${type}.${name}`);
        this.name = `${this.namespace}.${type}.${name}`;
        this.type = type;
    }

    printNode(stream:WritableStreamSet) {
        stream.write(this.sharp);
        stream.write(this.icon.sns);
        stream.write(this.icon.lambda);
        stream.write(this.style);
    }
}

class Bus implements Node {
    public readonly name;
    public readonly namespace = "Bus";
    public readonly connectors:Connection[] = [];
    public readonly schemas:Connection[] = [];
    public readonly archives:Connection[] = [];
    public readonly sharp = `${this.namespace}.*.shape: queue`
    public readonly style = `${this.namespace}.style.border-radius : 8`

    constructor(name: string, _connectors: IConnector[], _archives: IReplay[], _schemas: ITopic[]) {
        this.name = `${this.namespace}.${name}`;
        // console.log(_connectors);
        if(_connectors) { 
            for(const c of _connectors) {
            //    console.log(`&& ${c.target}.${c.name}`);
               this.connectors.push(
                new Connection(
                    new Connector(c.name, c.target),
                    this,
                    { relationship: Relationship.SUBSCRIBE, subject: c.topic }
                )
               );
            }
        }
        if(_archives) {
            for(const a of _archives) {
                this.archives.push(      
                    new Connection(
                        this,
                        new Archive(a.name),
                        { relationship: Relationship['HAS-A'], subject: a.pattern.topic }
                    )
                )
            }
        }
        if(_schemas) {
            for(const s of _schemas) {
                this.schemas.push(      
                    new Connection(
                        this,
                        new Schema(s.name),
                        { relationship: Relationship['HAS-A'], subject: s.name }
                    )
                )

            }
        }
    } 

    printNode(stream:WritableStreamSet) {
        stream.write(this.sharp);
        stream.write(this.style);
        const print = (c: Connection) => {
            c.print(stream);
        }
        this.connectors.forEach(print);
        this.schemas.forEach(print);
        this.archives.forEach(print);
        return ""
    }

}

class Schema implements Node {
    public name;
    public readonly namespace = "Schema";
    public readonly sharp = `${this.namespace}.*.shape: page`
    public readonly style = `${this.namespace}.style.border-radius : 8`

    constructor(name: string) {
        this.name = `${this.namespace}.${name}`;
    }

    printNode(stream:WritableStreamSet) {
        stream.write(this.style);
        stream.write(this.sharp);
    }
}

class Archive implements Node {
    public name;
    public readonly namespace = "Archive";
    public readonly sharp = `${this.namespace}.*.shape: cylinder`;
    public readonly style = `${this.namespace}.style.border-radius : 8`

    constructor(name: string) {
        this.name = `${this.namespace}.${name}`;
    }
    printNode(stream:WritableStreamSet) {
        stream.write(this.style);
        stream.write(this.sharp);
    }
}

const generate = () => {
    // console.log(JSON.stringify(config, null, 4));
    const writeStream = fs.createWriteStream('diagram.d2', {flags: 'w'});
    const stream:WritableStreamSet = new WritableStreamSet(writeStream);
    // console.log(config.eventbus);
    for(const bus of config.eventbus) {
      const eventBus = new Bus(bus.name, bus.connectors, bus.replays, bus.topics);
      eventBus.printNode(stream);
    }
   stream.flush(); 
}

generate();