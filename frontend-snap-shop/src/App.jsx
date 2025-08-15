import { useRef, useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import ProductCard from "@/ProductCard";
import axios from "axios";
import { BsChevronDown, BsChevronRight } from "react-icons/bs";
import { FaCheck, FaTimes } from "react-icons/fa";
import { FaSyncAlt } from "react-icons/fa"; 
import { FaBars } from "react-icons/fa"; 
import { createPortal } from "react-dom";

function SidebarSection({ title, open, setOpen, refreshButton, children }) {
  return (
    <div className="mb-2">
      <div className="flex items-center w-full mb-2">

        <span className="font-semibold text-gray-700">{title}</span>

        <div className="ml-auto flex items-center gap-2">
          {refreshButton}

          <button
            className="flex items-center focus:outline-none"
            onClick={() => setOpen(v => !v)}
            type="button"
            aria-label={open ? "Esconder" : "Mostrar"}
          >
            {open
              ? <BsChevronDown className="w-5 h-5 text-gray-700" />
              : <BsChevronRight className="w-5 h-5 text-gray-700" />
            }
          </button>
        </div>
      </div>

      <div
        className={`
          mb-4 transition-all duration-200 overflow-hidden
          ${open
            ? "max-h-[1000px] opacity-100"
            : "max-h-0      opacity-0"}
        `}
      >
        {open && <div>{children}</div>}
      </div>
    </div>
  )
}

function RefreshButton({ dirty, onClick, className }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        ml-2 w-7 h-7 flex items-center justify-center rounded border
        transition-colors
        ${dirty
          ? "bg-black border-black text-white opacity-100"
          : "bg-gray-100 border-gray-300 text-gray-400 opacity-50"
        }
        hover:opacity-100
        focus:outline-none
        `}
      disabled={!dirty}
      title="Atualizar"
    >
      <FaSyncAlt className="w-4 h-4" />
    </button>
  );
}

export default function App({ initialText = "", initialImage = null }) {

  const [search, setSearch] = useState(initialText);

  const [image, setImage] = useState(initialImage);
  const [imageSearchActive, setImageSearchActive] = useState(false);

  const [originalProducts, setOriginalProducts] = useState([]);
  const [products, setProducts] = useState([]);

  const [priceFrom, setPriceFrom] = useState("");
  const [priceTo, setPriceTo] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  const [orderBy, setOrderBy] = useState("relevance");

  const [showSimilarityOptions, setShowSimilarityOptions] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 16;

  const getSelectedSources = () =>
    Object.entries(selectedSources)
      .filter(([_, isChecked]) => isChecked)
      .map(([key]) => key);


  const [deepSearch, setDeepSearch] = useState(false);

  const fileInputRef = useRef();

  const handleImageUpload = async (eventOrFile) => {
    let file;
    if (eventOrFile instanceof File) {
      file = eventOrFile;
    } else {
      file = eventOrFile.target.files[0];
    }
    if (!file) return;

    setImage(file);
    setSearch("");
    setImageSearchActive(true);
    setIsLoading(true);
    setLoadingMessage("A procurar os melhores produtos...");
    setLastRefreshedSources(selectedSources);
    setLastRefreshedPrice({ priceFrom, priceTo });

    const formData = new FormData();
    formData.append("file", file);
    formData.append("sources", JSON.stringify(getSelectedSources()));
    if (priceFrom) formData.append("price_from", priceFrom);
    if (priceTo) formData.append("price_to", priceTo);

    if (deepSearch) {
      formData.append("amount", 40);
    } else {
      formData.append("amount", 40);
    }

    const endpoint = deepSearch
      ? "/api-main/deep"
      : "/api-main/light";

    try {
      const response = await axios.post(endpoint, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const { message, listings } = response.data;
      console.log(message);

      setOriginalProducts(listings);
      setProducts(listings);
      setCurrentPage(1);

    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSearch = async (order = orderBy) => {
    if (!search.trim()) return;

    setImage(null);
    setImageSearchActive(false);
    setIsLoading(true);
    setLoadingMessage("A procurar os melhores produtos...");
    setLastRefreshedSources(selectedSources);
    setLastRefreshedPrice({ priceFrom, priceTo });

    try {
      const response = await axios.get(`/api-main/search`, {
        params: {
          query: search,
          sources: JSON.stringify(getSelectedSources()),
          price_from: priceFrom || undefined,
          price_to: priceTo || undefined,
          order_by: order,
          amount: 40

        }
      });

      const { message, listings } = response.data;
      console.log(message);

      setOriginalProducts(listings);
      setProducts(sortProducts(listings, order));
      setCurrentPage(1);

    } catch (error) {
      console.error("Error searching products:", error);
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
    }
  };

  const handleOrderChange = async (order) => {
    setOrderBy(order);
    setCurrentPage(1);
    if (order === "relevance") {
      setProducts(originalProducts);
    } else if (order === "similarity" && image) {
      await handleImageUpload(image, "deep");
    } else {
      setProducts((prev) => sortProducts(prev, order));
    }
  };

  const [selectedSources, setSelectedSources] = useState({
    olx: true,
    vinted: true,
    wallapop: true,
  });

  const selectedCount = Object.values(selectedSources).filter(Boolean).length;

const estimatedTime = selectedCount === 1 ? 10
                    : selectedCount === 2 ? 15
                    : selectedCount === 3 ? 20
                    : 0;

  function sortProducts(products, orderBy) {

    let sorted = [...products];

    if (orderBy === "date_desc") {
      sorted.sort((a, b) => (b.date || 0) - (a.date || 0));
    } else if (orderBy === "date_asc") {
      sorted.sort((a, b) => (a.date || 0) - (b.date || 0));
    } else if (orderBy === "price_desc") {
      sorted.sort((a, b) => (extractPrice(b.price)) - (extractPrice(a.price)));
    } else if (orderBy === "price_asc") {
      sorted.sort((a, b) => (extractPrice(a.price)) - (extractPrice(b.price)));
    } else if (orderBy === "relevance") {
      return products;
    }
    return sorted;
  }

  function extractPrice(priceStr) {
    if (!priceStr) return 0;
    const match = priceStr.match(/[\d,.]+/);
    return match ? parseFloat(match[0].replace(',', '.')) : 0;
  }

  const orderOptions = [
    { value: "relevance", label: "Relevância" },
    { value: "date_desc", label: "Mais recentes" },
    { value: "date_asc", label: "Mais antigos" },
    { value: "price_desc", label: "Preço: Decrescente" },
    { value: "price_asc", label: "Preço: Crescente" },
  ];

  const [percentileFilter, setPercentileFilter] = useState(null);
  const [pricePercentiles, setPricePercentiles] = useState(null);

  const prevProductsRef = useRef();

  useEffect(() => {
    if (!products.length) {
      setPricePercentiles(null);
      return;
    }
    const numericPrices = products
      .map(p => extractPrice(p.price))
      .filter(n => !isNaN(n))
      .sort((a, b) => a - b);
    if (!numericPrices.length) {
      setPricePercentiles(null);
      return;
    }
    const getPercentile = (p) => {
      const idx = Math.floor(p * (numericPrices.length - 1));
      return numericPrices[idx];
    };
    setPricePercentiles({
      p25: getPercentile(0.25),
      p50: getPercentile(0.50),
      p75: getPercentile(0.75),
      currency: products.find(p => /\€|\$|£/.test(p.price))?.price.match(/€|\$|£/)?.[0] || "€"
    });

    const prev = prevProductsRef.current;
    if (
      !prev ||
      prev.length !== products.length ||
      prev.some((p, i) => p.id !== products[i]?.id)
    ) {
      setPercentileFilter(null);
    }
    prevProductsRef.current = products;
  }, [products]);

  useEffect(() => {
    setCurrentPage(1);
  }, [percentileFilter, products]);


  function filterByPercentile(products) {
    if (!percentileFilter || !pricePercentiles) return products;
    const { p25, p50, p75 } = pricePercentiles;
    return products.filter(product => {
      const price = extractPrice(product.price);
      switch (percentileFilter) {
        case "below25":
          return price < p25;
        case "25to50":
          return price >= p25 && price < p50;
        case "50to75":
          return price >= p50 && price < p75;
        case "above75":
          return price >= p75;
        default:
          return true;
      }
    });
  }

  const filteredProducts = filterByPercentile(products);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  useEffect(() => {
    if (initialText) {
      setSearch(initialText);
      handleSearch();
    } else if (initialImage) {
      setImage(initialImage);
      handleImageUpload(initialImage);
    }
  }, []);

  const [showLojas, setShowLojas] = useState(true);
  const [showOrder, setShowOrder] = useState(true);
  const [showPrice, setShowPrice] = useState(true);

  const [lastRefreshedSources, setLastRefreshedSources] = useState(selectedSources);
  const [lastRefreshedPrice, setLastRefreshedPrice] = useState({ priceFrom, priceTo });

  const lojasDirty = JSON.stringify(selectedSources) !== JSON.stringify(lastRefreshedSources);
  const precoDirty = priceFrom !== lastRefreshedPrice.priceFrom || priceTo !== lastRefreshedPrice.priceTo;

  const handleLojasRefresh = () => {
    if (imageSearchActive && image) {
      handleImageUpload(image);
    } else {
      handleSearch();
    }
  };
  const handlePrecoRefresh = () => {
    if (imageSearchActive && image) {
      handleImageUpload(image);
    } else {
      handleSearch();
    }
  };

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const questionRef = useRef();

  const handleShowTooltip = () => {
    if (questionRef.current && sidebarRef.current) {
      const btnRect = questionRef.current.getBoundingClientRect();
      const sidebarRect = sidebarRef.current.getBoundingClientRect();
      setTooltipPos({
        top: btnRect.bottom + 12,
        left: btnRect.left - sidebarRect.left + btnRect.width / 2,
      });
    }
    setShowTooltip(true);
  };

  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    const handleTouch = () => setIsTouch(true);
    window.addEventListener("touchstart", handleTouch, { once: true });
    return () => window.removeEventListener("touchstart", handleTouch);
  }, []);

  useEffect(() => {
    if (!showTooltip) return;
    function updateTooltipPos() {
      if (questionRef.current && sidebarRef.current) {
        const btnRect = questionRef.current.getBoundingClientRect();
        const sidebarRect = sidebarRef.current.getBoundingClientRect();
        setTooltipPos({
          top: btnRect.bottom + 12,
          left: btnRect.left - sidebarRect.left + btnRect.width / 2,
        });
      }
    }
    updateTooltipPos();
    window.addEventListener("scroll", updateTooltipPos);
    window.addEventListener("resize", updateTooltipPos);
    sidebarRef.current.addEventListener("scroll", updateTooltipPos);
    return () => {
      window.removeEventListener("scroll", updateTooltipPos);
      window.removeEventListener("resize", updateTooltipPos);
      if (sidebarRef.current) {
        sidebarRef.current.removeEventListener("scroll", updateTooltipPos);
      }
    };
  }, [showTooltip]);

  const sidebarRef = useRef();

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-white font-sans">
      <header className="w-full px-0 py-8 bg-white border-b border-gray-200 relative">
        <div className="w-full px-4 md:px-8">
          <div className="relative flex flex-row items-center justify-start pl-16 md:pl-0">
            <button
              className="md:hidden absolute left-4 top-1/2 -translate-y-1/2"
              onClick={() => setSidebarOpen(true)}
              aria-label="Abrir menu"
            >
              <FaBars className="w-6 h-6 text-gray-700" />
            </button>
            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-900 to-blue-400 bg-clip-text text-transparent">
              Snap & Shop
            </h1>
          </div>
          <p className="text-gray-600 mt-2 text-base md:text-lg text-left pl-16 md:pl-0">
            Procure produtos usados, por texto ou carregando uma imagem!
          </p>
        </div>
      </header>

      <div className="flex w-full min-h-[calc(100vh-96px)]">
        <aside
          ref={sidebarRef}
          className={`
    fixed top-0 bottom-0 left-0 z-40 w-64 bg-white border-r border-gray-200 px-6 py-8 flex-col
    transition-transform duration-300
    overflow-y-auto overflow-x-visible
    ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
    md:static md:translate-x-0 md:flex md:h-auto
  `}
          onClick={() => setShowTooltip(false)}
        >
          <button
            className="md:hidden mb-4"
            onClick={() => {
              setSidebarOpen(false);
              setShowTooltip(false);
            }}
            aria-label="Fechar menu"
          >
            <FaTimes className="w-6 h-6 text-gray-700" />
          </button>
          <div className="mb-6">
            <div className="flex items-center">
              <span className="font-semibold text-gray-700">Pesquisa por imagem com IA</span>
              <div className="relative group">
                <button
                  ref={questionRef}
                  type="button"
                  className="inline-flex items-center justify-center cursor-pointer text-blue-500 font-extrabold text-3xl rounded-full transition-colors hover:bg-blue-100 focus:bg-blue-200 select-none w-10 h-10 sm:w-8 sm:h-8 outline-none"
                  aria-label="Ajuda sobre pesquisa por imagem"
                  onClick={e => {
                    e.stopPropagation();
                    handleShowTooltip();
                  }}
                  onMouseEnter={!isTouch ? handleShowTooltip : undefined}
                  onMouseLeave={!isTouch ? () => setShowTooltip(false) : undefined}
                  onKeyDown={e => {
                    if (e.key === "Enter" || e.key === " ") setShowTooltip(true);
                  }}
                >
                  ?
                </button>
                {showTooltip && createPortal(
                  <div
                    className="fixed z-[9999] w-72 max-w-xs bg-white border border-gray-300 rounded-lg shadow-2xl p-4 text-xs text-gray-700"
                    style={{
                      top: tooltipPos.top,
                      left: tooltipPos.left,
                      transform: "translateX(-50%)",
                      pointerEvents: "auto"
                    }}
                    onClick={e => e.stopPropagation()}
                  >
                    Ativa uma pesquisa por imagem mais profunda e precisa, mostrando apenas os melhores resultados.<br /><br />
                    <strong>Estimativa de tempo:</strong> ~{estimatedTime}s
                  </div>,
                  document.body
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setDeepSearch(v => !v)}
              className={`mt-2 relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none ${deepSearch ? 'bg-green-500' : 'bg-red-500'
                }`}
              aria-pressed={deepSearch}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform ${deepSearch ? 'translate-x-7' : 'translate-x-1'
                  }`}
              >
                {deepSearch ? (
                  <span className="flex items-center justify-center h-full text-green-500 text-lg">
                    <FaCheck />
                  </span>
                ) : (
                  <span className="flex items-center justify-center h-full text-red-500 text-lg">
                    <FaTimes />
                  </span>
                )}
              </span>
            </button>
          </div>
          <SidebarSection
            title="Lojas"
            open={showLojas}
            setOpen={setShowLojas}
            refreshButton={
              <RefreshButton
                dirty={lojasDirty}
                onClick={handleLojasRefresh}
              />
            }
          >
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedSources.olx}
                onChange={() =>
                  setSelectedSources(prev => ({ ...prev, olx: !prev.olx }))
                }
              />
              <span>OLX</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedSources.vinted}
                onChange={() =>
                  setSelectedSources(prev => ({ ...prev, vinted: !prev.vinted }))
                }
              />
              <span>Vinted</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedSources.wallapop}
                onChange={() =>
                  setSelectedSources(prev => ({ ...prev, wallapop: !prev.wallapop }))
                }
              />
              <span>Wallapop</span>
            </label>
          </SidebarSection>


          <SidebarSection title="Ordenar por" open={showOrder} setOpen={setShowOrder}>
            <div className="flex flex-col gap-2">
              <Button
                variant={orderBy === "relevance" ? "default" : "outline"}
                className="w-full"
                onClick={() => handleOrderChange("relevance")}
              >
                Relevância
              </Button>
              <Button
                variant={orderBy === "date_desc" ? "default" : "outline"}
                className="w-full"
                onClick={() => handleOrderChange("date_desc")}
              >
                Mais recentes
              </Button>
              <Button
                variant={orderBy === "date_asc" ? "default" : "outline"}
                className="w-full"
                onClick={() => handleOrderChange("date_asc")}
              >
                Mais antigos
              </Button>
              <Button
                variant={orderBy === "price_desc" ? "default" : "outline"}
                className="w-full"
                onClick={() => handleOrderChange("price_desc")}
              >
                Preço: Decrescente
              </Button>
              <Button
                variant={orderBy === "price_asc" ? "default" : "outline"}
                className="w-full"
                onClick={() => handleOrderChange("price_asc")}
              >
                Preço: Crescente
              </Button>
            </div>
          </SidebarSection>
          <SidebarSection
            title="Preço"
            open={showPrice}
            setOpen={setShowPrice}
            refreshButton={
              <RefreshButton
                dirty={precoDirty}
                onClick={handlePrecoRefresh}
              />
            }
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 w-8">De:</span>
                <Input
                  type="number"
                  placeholder="mín"
                  value={priceFrom}
                  onChange={e => setPriceFrom(e.target.value)}
                  className="w-20"
                  min={0}
                />
                <span className="text-sm text-gray-600">€</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 w-8">A:</span>
                <Input
                  type="number"
                  placeholder="máx"
                  value={priceTo}
                  onChange={e => setPriceTo(e.target.value)}
                  className="w-20"
                  min={0}
                />
                <span className="text-sm text-gray-600">€</span>
              </div>
            </div>
            {pricePercentiles && products.length > 0 && (
              <div className="mt-6 flex flex-col gap-2">
                <Button
                  variant={percentileFilter === "below25" ? "default" : "outline"}
                  className="w-full"
                  onClick={() => setPercentileFilter("below25")}
                >
                  Abaixo de {pricePercentiles.p25} {pricePercentiles.currency}
                </Button>
                <Button
                  variant={percentileFilter === "25to50" ? "default" : "outline"}
                  className="w-full"
                  onClick={() => setPercentileFilter("25to50")}
                >
                  {pricePercentiles.p25} - {pricePercentiles.p50} {pricePercentiles.currency}
                </Button>
                <Button
                  variant={percentileFilter === "50to75" ? "default" : "outline"}
                  className="w-full"
                  onClick={() => setPercentileFilter("50to75")}
                >
                  {pricePercentiles.p50} - {pricePercentiles.p75} {pricePercentiles.currency}
                </Button>
                <Button
                  variant={percentileFilter === "above75" ? "default" : "outline"}
                  className="w-full"
                  onClick={() => setPercentileFilter("above75")}
                >
                  Acima de {pricePercentiles.p75} {pricePercentiles.currency}
                </Button>
                {percentileFilter && (
                  <Button
                    variant="ghost"
                    className="w-full text-s mt-1"
                    onClick={() => setPercentileFilter(null)}
                  >
                    Limpar filtro
                  </Button>
                )}
              </div>
            )}
          </SidebarSection>
        </aside>

        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-30 z-30 md:hidden"
            onClick={() => {
              setSidebarOpen(false);
              setShowTooltip(false); 
            }}
          />
        )}

        <section className="flex-1 px-2 py-6 md:px-8 md:py-10">
          <div className="flex flex-col items-center justify-center gap-6 mb-8">
            <label
              htmlFor="file-upload-light"
              className="bg-white flex flex-col items-center justify-center border-4 border-dashed border-blue-400 rounded-xl p-12 cursor-pointer hover:bg-blue-50 transition"
              onDrop={e => {
                e.preventDefault();
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleImageUpload(e.dataTransfer.files[0]);
                }
              }}
              onDragOver={e => e.preventDefault()}
              onDragEnter={e => e.preventDefault()}
            >
              <input
                id="file-upload-light"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                ref={fileInputRef} 
              />
              <span className="text-2xl font-semibold text-blue-700 mb-2">Carregue ou arraste uma imagem</span>
              <span className="text-sm text-gray-500">Procure produtos por imagem</span>
            </label>
            <div className="flex items-center gap-2 text-gray-400">
              <span className="border-t border-gray-300 flex-1"></span>
              <span className="text-xs">ou pesquise por texto</span>
              <span className="border-t border-gray-300 flex-1"></span>
            </div>
            <div className="bg-white flex gap-2 w-full max-w-md">
              <Input
                type="text"
                placeholder="Pesquisar produto..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
                className="flex-1"
              />
              <Button
                onClick={handleSearch}
                className="shrink-0 font-normal py-2 px-4 sm:w-auto"
                disabled={!search.trim()}
              >
                <span className="hidden sm:inline">Pesquisar</span>
                <span className="sm:hidden">🔍</span>
              </Button>
            </div>
          </div>
          <div className="mt-8 min-h-[200px] flex items-center justify-center">
            {isLoading ? (
              <div className="w-full max-w-sm text-center">
                <Progress value={100} className="animate-pulse mb-2" />
                <p className="text-gray-600 text-sm">
                  {loadingMessage || "Carregando..."}
                </p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="w-full max-w-sm text-center">
                <p className="text-gray-500 text-lg font-semibold">
                  Não encontrámos produtos para a sua pesquisa.
                </p>
              </div>
            ) : (
              <div className="w-full flex flex-col items-center">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 w-full">
                  {paginatedProducts.map((product, idx) => (
                    <ProductCard key={idx} {...product} />
                  ))}
                </div>
                {totalPages > 1 && (
                  <div className="mt-8 w-full flex justify-center">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                            disabled={currentPage === 1}
                          />
                        </PaginationItem>
                        <PaginationItem>
                          <PaginationLink
                            isActive={currentPage === 1}
                            onClick={() => setCurrentPage(1)}
                          >
                            1
                          </PaginationLink>
                        </PaginationItem>
                        {currentPage > 3 && (
                          <PaginationItem>
                            <PaginationEllipsis />
                          </PaginationItem>
                        )}
                        {currentPage > 2 && currentPage < totalPages && (
                          <PaginationItem>
                            <PaginationLink
                              onClick={() => setCurrentPage(currentPage - 1)}
                            >
                              {currentPage - 1}
                            </PaginationLink>
                          </PaginationItem>
                        )}
                        {currentPage !== 1 && currentPage !== totalPages && (
                          <PaginationItem>
                            <PaginationLink isActive>{currentPage}</PaginationLink>
                          </PaginationItem>
                        )}
                        {currentPage < totalPages - 1 && currentPage > 1 && (
                          <PaginationItem>
                            <PaginationLink
                              onClick={() => setCurrentPage(currentPage + 1)}
                            >
                              {currentPage + 1}
                            </PaginationLink>
                          </PaginationItem>
                        )}
                        {currentPage < totalPages - 2 && (
                          <PaginationItem>
                            <PaginationEllipsis />
                          </PaginationItem>
                        )}
                        {totalPages > 1 && (
                          <PaginationItem>
                            <PaginationLink
                              isActive={currentPage === totalPages}
                              onClick={() => setCurrentPage(totalPages)}
                            >
                              {totalPages}
                            </PaginationLink>
                          </PaginationItem>
                        )}
                        <PaginationItem>
                          <PaginationNext
                            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                            disabled={currentPage === totalPages}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </div>
            )}
          </div>
          {image && imageSearchActive && (
            <div className="fixed bottom-6 right-6 z-20 flex flex-col items-center bg-white/90 border border-gray-300 rounded-xl shadow-lg p-3">
              <span className="text-xs text-gray-500 mb-1">Imagem pesquisada:</span>
              <img
                src={typeof image === "string" ? image : URL.createObjectURL(image)}
                alt="Imagem pesquisada"
                className="w-32 h-32 object-cover rounded-lg border"
                style={{ background: "#f3f4f6" }}
              />
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
