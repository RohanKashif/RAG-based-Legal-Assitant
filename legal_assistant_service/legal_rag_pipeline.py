"""
legal_rag_pipeline.py
Reorganized for best practices: grouped imports, configuration, functions, and graph logic.
"""

# =========================
# Imports
# =========================
import pandas as pd
from datasets import load_dataset
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.vectorstores import Chroma
from langchain.embeddings import HuggingFaceEmbeddings
import google.generativeai as genai
from langchain_google_genai.chat_models import ChatGoogleGenerativeAI
from langgraph.graph import StateGraph, END
from typing import TypedDict, List

# =========================
# Configuration & Constants
# =========================
API_KEY = "AIzaSyBrkvR64VztwXemofYgLSHEb3-j2EK8DGQ"
CHROMA_DIR = "chroma_legal"
EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"
LLM_MODEL = "gemini-2.5-flash"
CHUNK_SIZE = 800
CHUNK_OVERLAP = 100
RETRIEVER_K = 5

# =========================
# Data Preparation & RAG Setup
# =========================
def setup_rag_components():
    """Loads data from HuggingFace, splits text, and returns docs."""
    dataset = load_dataset("Shekswess/legal-documents", split="train")
    df = pd.DataFrame(dataset)
    texts = df["text"].tolist()
    keywords = df["keyword"].tolist()
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE,
        chunk_overlap=CHUNK_OVERLAP
    )
    docs = []
    for txt, kw in zip(texts, keywords):
        chunks = text_splitter.split_text(txt)
        for chunk in chunks:
            docs.append({"text": chunk, "keyword": kw})
    return docs

docs = setup_rag_components()
embeddings = HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL)
texts = [doc["text"] for doc in docs]
metas = [{"keyword": doc["keyword"]} for doc in docs]
db = Chroma.from_texts(texts, embeddings, metadatas=metas, persist_directory=CHROMA_DIR)
retriever = db.as_retriever(search_kwargs={"k": RETRIEVER_K})

# =========================
# LLM Configuration
# =========================
genai.configure(api_key=API_KEY)
llm = ChatGoogleGenerativeAI(model=LLM_MODEL, temperature=0.2, google_api_key=API_KEY)

# =========================
# State & Graph Definition
# =========================
class State(TypedDict):
    question: str
    docs: List[str]
    summary: str
    answer: str

graph = StateGraph(State)

# =========================
# Graph Nodes
# =========================
def retrieve_node(state: State):
    docs = retriever.get_relevant_documents(state["question"])
    state["docs"] = [d.page_content for d in docs]
    return state

graph.add_node("retrieve", retrieve_node)

def summarize_node(state: State):
    context = "\n\n".join(state["docs"])
    summary = llm.predict(f"Summarize the following legal texts:\n{context}")
    state["summary"] = summary
    return state

graph.add_node("summarize", summarize_node)

def answer_node(state: State):
    prompt = f"""
You are a legal assistant. Question: {state['question']}
Context summary: {state['summary']}
Provide a clear, grounded answer.
"""
    state["answer"] = llm.predict(prompt)
    return state

graph.add_node("answer", answer_node, outputs=[END])


# =========================
# Graph Edges & Compilation
# =========================
graph.add_edge("retrieve", "summarize")
graph.add_edge("summarize", "answer")

graph.set_entry_point("retrieve")   # 👈 Tell LangGraph to start here
graph.set_finish_point("answer")    # 👈 Tell LangGraph to stop here

workflow = graph.compile()
