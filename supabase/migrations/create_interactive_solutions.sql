-- Create interactive_solutions table for storing interactive math solution configurations
CREATE TABLE IF NOT EXISTS public.interactive_solutions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    question_id TEXT NOT NULL UNIQUE,
    has_interactive_graph BOOLEAN DEFAULT false,
    graph_config JSONB,
    parameters JSONB,
    solution_steps JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Indexes for performance
    CONSTRAINT interactive_solutions_question_id_key UNIQUE (question_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_interactive_solutions_question_id ON public.interactive_solutions(question_id);
CREATE INDEX IF NOT EXISTS idx_interactive_solutions_has_graph ON public.interactive_solutions(has_interactive_graph);

-- Enable RLS
ALTER TABLE public.interactive_solutions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Interactive solutions are viewable by everyone" ON public.interactive_solutions
    FOR SELECT USING (true);

CREATE POLICY "Interactive solutions are insertable by authenticated users" ON public.interactive_solutions
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Interactive solutions are updatable by authenticated users" ON public.interactive_solutions
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at_interactive_solutions()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger
CREATE TRIGGER on_interactive_solutions_updated
    BEFORE UPDATE ON public.interactive_solutions
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at_interactive_solutions();

-- Insert sample data
INSERT INTO public.interactive_solutions (question_id, has_interactive_graph, graph_config, parameters, solution_steps) VALUES 
(
    'MATH-INTERACTIVE-001',
    true,
    '{
        "type": "quadratic",
        "xRange": [-1, 5],
        "yRange": [-5, 8],
        "showGrid": true,
        "showAxis": true,
        "title": "Quadratic Function: y = ax² + bx + c"
    }'::jsonb,
    '[
        {
            "name": "a",
            "label": "Coefficient a",
            "value": 2,
            "min": -5,
            "max": 5,
            "step": 0.1,
            "description": "Controls the width and direction of the parabola"
        },
        {
            "name": "b",
            "label": "Coefficient b",
            "value": -8,
            "min": -10,
            "max": 10,
            "step": 0.1,
            "description": "Affects the horizontal position of the vertex"
        },
        {
            "name": "c",
            "label": "Constant c",
            "value": 6,
            "min": -10,
            "max": 10,
            "step": 0.1,
            "description": "The y-intercept of the parabola"
        }
    ]'::jsonb,
    '[
        {
            "id": "step-1",
            "title": "Use the First Point",
            "description": "Substitute (0, 6) into y = ax² + bx + c",
            "fromExpression": {
                "latex": "y = ax^2 + bx + c",
                "display": "y = ax² + bx + c"
            },
            "toExpression": {
                "latex": "6 = a(0)^2 + b(0) + c",
                "display": "6 = a(0)² + b(0) + c = c"
            },
            "explanation": "When x = 0, all terms with x disappear, leaving only c = 6",
            "hint": "What happens when you substitute x = 0 into the equation?"
        }
    ]'::jsonb
);

COMMENT ON TABLE public.interactive_solutions IS 'Store interactive math solution configurations for SAT questions';
COMMENT ON COLUMN public.interactive_solutions.question_id IS 'Reference to the question this interactive solution belongs to';
COMMENT ON COLUMN public.interactive_solutions.has_interactive_graph IS 'Whether this solution includes an interactive graph';
COMMENT ON COLUMN public.interactive_solutions.graph_config IS 'Configuration for the interactive graph (type, ranges, etc.)';
COMMENT ON COLUMN public.interactive_solutions.parameters IS 'Array of adjustable parameters for the interactive graph';
COMMENT ON COLUMN public.interactive_solutions.solution_steps IS 'Step-by-step interactive solution data';