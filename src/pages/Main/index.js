import React, { Component } from 'react';

import { FaGithubAlt, FaPlus, FaSpinner } from 'react-icons/fa';
import { Link } from 'react-router-dom';

import api from '../../services/api';

import { Form, SubmitButton, List, Input } from './styles';

import Container from '../../components/Container/index';

export default class Main extends Component {
  state = {
    newRepo: '',
    repositories: [],
    loading: false,
    notFound: false,
    msgerror: '',
  };

  componentDidMount() {
    const repositories = localStorage.getItem('repositories');

    if (repositories) {
      this.setState({ repositories: JSON.parse(repositories) });
    }
  }

  componentDidUpdate(_, prevState) {
    const { repositories } = this.state;
    if (prevState.repositories !== repositories) {
      localStorage.setItem('repositories', JSON.stringify(repositories));
    }
  }

  handleInputChange = e => {
    this.setState({ newRepo: e.target.value, notFound: false, msgerror: '' });
  };

  handleSubmit = async e => {
    try {
      e.preventDefault();

      this.setState({ loading: true });

      const { newRepo, repositories } = this.state;

      const duplicatedRepository = repositories.find(x => x.name === newRepo);

      if (duplicatedRepository) {
        throw new Error(this.setState({ msgerror: 'Duplicated Repository' }));
      }

      const response = await api.get(`/repos/${newRepo}`);

      const data = {
        name: response.data.full_name,
      };

      this.setState({
        repositories: [...repositories, data],
        newRepo: '',
        loading: false,
        notFound: false,
        msgerror: '',
      });
    } catch (err) {
      if (err.response !== undefined) {
        this.setState({
          notFound: true,
          loading: false,
          msgerror: 'Repository not found',
        });
      } else {
        this.setState({
          notFound: true,
          loading: false,
          msgerror: 'Repository already in the list',
        });
      }
    }
  };

  render() {
    const { newRepo, loading, repositories, notFound, msgerror } = this.state;

    return (
      <Container>
        <h1>
          <FaGithubAlt />
          Repositórios
        </h1>

        <Form onSubmit={this.handleSubmit}>
          <Input
            type="text"
            placeholder="Adicionar Repositório"
            value={newRepo}
            onChange={this.handleInputChange}
            notFound={notFound}
          />

          <SubmitButton loading={loading}>
            {loading ? (
              <FaSpinner color="#fff" size={14} />
            ) : (
              <FaPlus color="#fff" size={14} />
            )}
          </SubmitButton>
        </Form>
        <p style={{ color: '#e74c3c' }}>{msgerror}</p>

        <List>
          {repositories.map(repository => (
            <li key={repository.name}>
              <span>{repository.name}</span>
              <Link to={`/repository/${encodeURIComponent(repository.name)}`}>
                Detalhes
              </Link>
            </li>
          ))}
        </List>
      </Container>
    );
  }
}
