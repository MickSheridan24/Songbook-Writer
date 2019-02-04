import React, { Component } from "react";
import "./App.css";
import PDF, { Text, AddPage } from "jspdf-react";
//import pdfComponent from "./pdfComponent";

class Example extends Component {
  constructor(props) {
    super(props);
    this.state = {
      text: this.props.text,
      out: (
        <PDF
          properties={{ title: "Songbook", fontFamily: "monospace" }}
          preview={true}
        >
          <Text fontName="monospace" x={35} y={25} size={20}>
            {this.props.text}
          </Text>
          <AddPage />
        </PDF>
      ),
      changing: false
    };
    this.componentWillMount = this.componentWillMount.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.componentWillUnmount = this.componentWillUnmount.bind(this);
  }
  componentWillMount() {
    console.log("Component Will Mount");

    console.log(this.props.text);
    if (!this.props.text) {
      console.log("Text did not load");
    }
  }

  componentDidMount() {
    console.log("Component Did Mount");
  }
  componentWillUnmount() {
    console.log("Component Will Unmount");
  }

  componentDidUpdate() {
    console.log("did update");

    if (this.state.changing) {
      console.log("loading");
      this.forceUpdate();
    }
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    let load = <div>Changing...</div>;

    if (nextProps.mutate === true) {
      if (nextProps.text !== prevState.text) {
        console.log("Changin them Props");

        return {
          text: nextProps.text,
          out: load,
          changing: true
        };
      } else {
        console.log("Props have been changed");
        return {
          out: (
            <PDF properties={{ title: "Songbook" }} preview={true}>
              <Text className="TextPDF" x={35} y={25} size={20}>
                {nextProps.text}
              </Text>
              <AddPage />
            </PDF>
          ),
          changing: false
        };
      }
    } else {
      console.log("Fancier Receiver is unneccessary");
      return null;
    }
  }

  render() {
    return <div>{this.state.out}</div>;
  }
}
export default Example;

/*
<AddPage />
          <Table columns={columns} rows={rows} />
          <AddPage format="a6" orientation="l" />
          <Text x={10} y={10} color="red">
            Sample
          </Text>
          <Line lines={30} x={11} y={11} scale={11} />
          <AddPage />
          <Html sourceById="page" /><div

          id="page"
          style={{
            visibility: "hidden"
          }}
        >
          <h1>Source Html</h1>
          <p>
            <strong>lorem ipsumLorem </strong>Ipsum is simply dummy text of the
            printing and typesetting industry. Lorem Ipsum has been the
            industry's standard dummy text ever since the 1500s, when an unknown
            printer took a galley of type and scrambled it to make a type
            specimen book. It has survived not only five centuries, but also the
            leap into electronic typesetting, remaining essentially unchanged.
            It was popularised in the 1960s with the release of Letraset sheets
            containing Lorem Ipsum passages, and more recently with desktop
            publishing software like Aldus PageMaker including versions of Lorem
            Ipsum.
          </p>
        </div>*/
