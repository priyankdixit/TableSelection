import React, { useState, useEffect, useCallback, FormEvent, useRef } from 'react';
import { DataTable, DataTableSelectionMultipleChangeEvent } from 'primereact/datatable';
import { Column } from 'primereact/column';
import axios from 'axios';
import { InputSwitch } from 'primereact/inputswitch';
import { OverlayPanel } from 'primereact/overlaypanel';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext'; 

interface Artwork {
    id: number;
    title: string;
    place_of_origin: string;
    artist_display: string;
    inscriptions: string;
    date_start: number;
    date_end: number;
}

const App: React.FC = () => {
    const [artworks, setArtworks] = useState<Artwork[]>([]);
    const [selectedArtworks, setSelectedArtworks] = useState<Artwork[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [totalRecords, setTotalRecords] = useState<number>(0);
    const [page, setPage] = useState<number>(0); 
    const [first, setFirst] = useState<number>(0);
    const [rows, setRows] = useState<number>(12); 
    const [rowClick, setRowClick] = useState<boolean>(false);
    const [searchValue, setSearchValue] = useState<string>(''); 
    const [allArtworks, setAllArtworks] = useState<Artwork[]>([]); 

    const op = useRef<OverlayPanel>(null);

    useEffect(() => {
        fetchData(page + 1); 
    }, [page, rows]);

    const fetchData = async (page: number) => {
        setLoading(true);
        try {
            const response = await axios.get(`https://api.artic.edu/api/v1/artworks?page=${page}&limit=${rows}`);
            const { data, pagination } = response.data;
            setArtworks(data);
            setTotalRecords(pagination.total);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
        setLoading(false);
    };

    const onPageChange = (event: any) => {
        setPage(event.page);
        setFirst(event.first);
        setRows(event.rows); 
    };

    const onSelectionChange = (e: DataTableSelectionMultipleChangeEvent<Artwork[]>) => {
        setSelectedArtworks(e.value as Artwork[]);
    };

    const toggleOverlay = useCallback((e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        if (op.current) {
            op.current.toggle(e); // Ensure op.current is not null before toggling
        }
    }, []);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const num = parseInt(searchValue, 10); 
    
        if (num > 0) {
            let accumulatedArtworks: Artwork[] = []; 
            let currentPage = 1;
    
            // Fetch enough pages until we have the required number of artworks
            while (accumulatedArtworks.length < num && currentPage <= Math.ceil(num / rows)) {
                const response = await axios.get(`https://api.artic.edu/api/v1/artworks?page=${currentPage}&limit=${rows}`);
                const { data } = response.data;
    
                accumulatedArtworks = [...accumulatedArtworks, ...data];
                currentPage += 1; 
            }
    
           
            const selectedArtworks = accumulatedArtworks.slice(0, num);
    
            // Update selected artworks state
            setSelectedArtworks(selectedArtworks);
        }
    
        if (op.current) {
            op.current.hide(); 
        }
    };

    return (
        <div>
            <InputSwitch checked={rowClick} onChange={(e) => setRowClick(e.value)} />
            <DataTable value={artworks} paginator rows={12} first={first} totalRecords={totalRecords}
                lazy loading={loading} onPage={onPageChange} dataKey="id"
               
                selectionMode={rowClick ? null : 'checkbox'}
                selection={selectedArtworks} onSelectionChange={onSelectionChange}
                tableStyle={{ maxWidth: '100rem' }}>
                <Column
                    headerStyle={{ width: '3rem' }}
                    bodyStyle={{ textAlign: 'center' }}
                    selectionMode="multiple"
                    header={
                        <Button type="button"  icon="pi pi-chevron-down" onClick={toggleOverlay}  style={{
                            backgroundColor: 'transparent',
                            border: 'none',
                            padding: '0',
                            width: 'auto',
                            height: 'auto',
                            boxShadow: 'none',
                            color:'black',
                            marginRight:'0.5rem'     
                        }} />
                    }
                />
                <Column field="title" header="Title" />
                <Column field="place_of_origin" header="Place of Origin" />
                <Column field="artist_display" header="Artist" />
                <Column field="inscriptions" header="Inscriptions" />
                <Column field="date_start" header="Date Start" />
                <Column field="date_end" header="Date End" />
            </DataTable>
            
           
            <OverlayPanel ref={op}>
                <form onSubmit={handleSubmit}>
                    <div className="p-field">
                        <InputText id="rows" value={searchValue} placeholder='Number of Rows to Select' onChange={(e) => setSearchValue(e.target.value)} />
                    </div>
                    <Button type="submit" label="Select Rows" className="p-mt-2" style={{color:'black',borderColor:'black',marginTop:'0.5rem'}}/>
                </form>
            </OverlayPanel>
        </div>
    );
};

export default App;
