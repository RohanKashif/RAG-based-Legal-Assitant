
# FastAPI app for Legal RAG Assistant
from fastapi import FastAPI, Request
from pydantic import BaseModel
from legal_assistant_service.legal_rag_pipeline import workflow, retriever, llm
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Legal RAG Assistant", description="Ask questions about legal documents and get AI-assisted answers.")

# Root endpoint to avoid 404 on /
@app.get("/")
async def read_root():
    return {"message": "Welcome to the Legal Assistant API"}

# Allow CORS for open-source/public deployment
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AskRequest(BaseModel):
    question: str
    temperature: float = 0.3
    top_k: int = 3

class AskResponse(BaseModel):
    answer: str
    docs: list

@app.post("/ask", response_model=AskResponse)
async def ask(request: AskRequest):
    retriever.search_kwargs["k"] = request.top_k
    if hasattr(llm, "temperature"):
        llm.temperature = request.temperature
    result = workflow.invoke({"question": request.question})
    answer = result["answer"]
    docs = result["docs"]
    # If docs are strings, wrap as objects with page_content for compatibility
    retrieved_docs = [{"page_content": doc} if isinstance(doc, str) else doc for doc in docs]
    return AskResponse(answer=answer, docs=retrieved_docs)
