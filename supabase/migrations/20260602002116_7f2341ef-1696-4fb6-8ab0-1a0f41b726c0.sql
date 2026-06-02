-- Remove writes diretos do operador em disposal_events para impedir burlar o cálculo de ELP.
-- A única via de criação/atualização passa a ser a server function (service_role).
DROP POLICY IF EXISTS "Operators insert own events" ON public.disposal_events;
DROP POLICY IF EXISTS "Operators update own events" ON public.disposal_events;

-- Operadores também não podem mais marcar batch como 'validado' direto.
DROP POLICY IF EXISTS "Operators update own batches" ON public.batches;

-- Mantém:
--  * Operators view own events / batches (SELECT)
--  * Operators insert own batches (necessário não — server function passa a inserir via service_role)
--  * Validators view/update all events
-- Removemos também INSERT direto em batches por consistência (server fn faz tudo).
DROP POLICY IF EXISTS "Operators insert own batches" ON public.batches;