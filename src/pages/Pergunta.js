import React from 'react';
import { Link } from "react-router-dom";
import { Container, Table, Form, Button } from 'react-bootstrap';

function postPergunta(pergunta, update) {
  const request = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pergunta: pergunta })
  };
  fetch('http://localhost:5000/perguntas', request)
    .then(response => response.json())
    .then(data => update(data.id_pergunta, pergunta));
}

function NovaPergunta(props) {
  const [texto, setTexto] = React.useState('');
  
  function handleChange (event) {
    setTexto(event.target.value);
  }

  function handleClick(event) {
    postPergunta(texto, props.update);
    setTexto('');
  }

  return (
    <Container>
      <Form>
        <Form.Group>
          <Form.Label> Faça a sua pergunta: </Form.Label>
          <Form.Control id="textarea-pergunta" as="textarea" value={texto} onChange={handleChange}/>
        </Form.Group>
        <Button id="btn-pergunta" onClick={handleClick}>Enviar</Button>
      </Form>
    </Container>
  );
}

function Pergunta() {
  const [listaPerguntas, setListaPerguntas] = React.useState([]);
  const [termoBusca, setTermoBusca] = React.useState('');
  const [buscaAplicada, setBuscaAplicada] = React.useState('');
  const [carregando, setCarregando] = React.useState(true);
  const [erroBusca, setErroBusca] = React.useState(false);

  const carregarPerguntas = React.useCallback((termo) => {
  const busca = termo.trim();
  const url = busca
    ? `http://localhost:5000/?busca=${encodeURIComponent(busca)}`
    : 'http://localhost:5000';

  setBuscaAplicada(busca);
  setCarregando(true);
  setErroBusca(false);

  fetch(url)
    .then(response => response.json())
    .then(data => {
      setListaPerguntas(data);
      setCarregando(false);
    })
    .catch(() => {
      setErroBusca(true);
      setCarregando(false);
    });
}, []);

  function buscarPerguntas(event) {
    event.preventDefault();
    carregarPerguntas(termoBusca);
  }

  function limparBusca() {
    setTermoBusca('');
    carregarPerguntas('');
  }

  function adicionarNovaPergunta(id_pergunta, pergunta) {
    if (buscaAplicada) {
      carregarPerguntas(buscaAplicada);
      return;
    }
    setListaPerguntas((prev) => {
      const novaPergunta = {
        id_pergunta: id_pergunta,
        texto: pergunta,
        num_respostas: 0,
      };
      return [...prev, novaPergunta];
    });
  }

  function TabelaPerguntas() {   

    function LinhaTabela({ pergunta }) {
      return (
        <tr>
          <td className="text-center"> {pergunta.id_pergunta} </td>
          <td> {pergunta.texto} </td>
          <td className="text-center"> 
              <Link to = {`/resposta/${pergunta.id_pergunta}`}> 
                 {pergunta.num_respostas}
              </Link>
          </td>
        </tr>
      );
    }

    function TabelaPrincipal() {
      const linhas = listaPerguntas.map(p => ( <LinhaTabela pergunta={p} key={p.id_pergunta} /> ));  
      return (
        <div className="container">
          <center><h5>Peguntas Atuais</h5></center>
          <Table id="tabela-perguntas" striped bordered>
            <thead>
              <tr>
                <th className="text-center">ID</th>
                <th className="text-center">Pergunta</th>
                <th className="text-center"># Respostas</th>
              </tr>
            </thead>
            <tbody>
              {linhas}
            </tbody>
          </Table>
        </div>
      );
    }

    return (
      <div>
        <Form onSubmit={buscarPerguntas} className="container mb-3">
          <Form.Group>
            <Form.Label htmlFor="busca-perguntas">Buscar perguntas</Form.Label>
            <Form.Control id="busca-perguntas" type="search" value={termoBusca}
              onChange={event => setTermoBusca(event.target.value)} />
          </Form.Group>
          <Button type="submit" className="mt-2 me-2">Pesquisar</Button>
          <Button type="button" variant="secondary" className="mt-2" onClick={limparBusca}>Limpar</Button>
        </Form>
        {carregando ? <p className="container">Carregando perguntas...</p> :
          !erroBusca && <TabelaPrincipal />}
        {!carregando && !erroBusca && buscaAplicada && listaPerguntas.length === 0 &&
          <p className="container">Nenhuma pergunta encontrada para esta busca.</p>}
        {erroBusca && <p className="container">Não foi possível carregar as perguntas.</p>}
        <NovaPergunta update={adicionarNovaPergunta}/>
      </div> 
    );
  }
    
  React.useEffect(() => {
    carregarPerguntas('');
  }, [carregarPerguntas]);
    
  return (
    <div className="container"> 
      <TabelaPerguntas />
    </div>
  );
}

export default Pergunta;
