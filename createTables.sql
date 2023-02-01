DELETAR itens => DELETE FROM movies WHERE id = 3; 

Editar itens => UPDATE movies SET "movieName" = 'Miranha de volta ao lar' WHERE id = 1; 

UPDATE clientes
SET
  (nome, endereco, preco) = ROW('Fulano', 'Rua do Sol', preco * 1.1)
WHERE id = 1;